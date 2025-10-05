"""
This module contains all comic-related routes for the NASAChallenge API.
"""

import os
import json
import logging
import uuid
import base64
import textwrap
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
from io import BytesIO

from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from lightrag.base import QueryParam
from lightrag.api.utils_api import get_combined_auth_dependency

from ascii_colors import trace_exception

# Google Generative AI imports
import google.generativeai as genai
from google.generativeai import types
from PIL import Image, ImageDraw, ImageFont, ImageFile

router = APIRouter(tags=["comic"])

# -----------------------------
# Comic Generation Configuration
# -----------------------------

# Comic settings
COMIC_PAGES = 2
PANELS_PER_PAGE = 4
TOTAL_PANELS = COMIC_PAGES * PANELS_PER_PAGE
COMIC_SIZE = (1024, 1024)  # width, height of each final page
FONT_SIZE = 24
FONT_PATH = "arial.ttf"  # falls back to default if missing
STYLE_HINT = (
    "clean comic-book art, bold ink outlines, flat colors, readable composition, "
    "square layout, gently stylized, scientific illustration style for NASA content. "
)

# Models
TEXT_MODEL = "gemini-2.5-flash"
IMAGE_MODEL = "gemini-2.5-flash-image"

# --- Safety/robustness helpers ---
ImageFile.LOAD_TRUNCATED_IMAGES = True
PNG_HDR = b"\x89PNG\r\n\x1a\n"
JPG_HDR = b"\xff\xd8\xff"


def _looks_like_image(b: bytes) -> bool:
    return isinstance(b, (bytes, bytearray)) and (b.startswith(PNG_HDR) or b.startswith(JPG_HDR))


def extract_image_bytes_from_response(response) -> bytes:
    """Walk through candidates/parts and return real image bytes (PNG/JPEG/WEBP).
    Handles inline_data as bytes or base64. Raises RuntimeError if none found.
    """
    if not getattr(response, "candidates", None):
        raise RuntimeError("No candidates in image response.")
    for cand in response.candidates:
        parts = getattr(cand.content, "parts", []) or []
        for p in parts:
            inline = getattr(p, "inline_data", None)
            if inline and getattr(inline, "mime_type", "").startswith("image/"):
                data = inline.data
                raw = bytes(data) if isinstance(data, (bytes, bytearray)) else base64.b64decode(data)
                # Might be PNG/JPEG/WEBP. We still return; PIL can try to open WEBP if available.
                return raw
    raise RuntimeError("No image parts found in response (model may have returned text/safety).")


def open_font():
    try:
        return ImageFont.truetype(FONT_PATH, FONT_SIZE)
    except IOError:
        print("Font not found. Using default font.")
        return ImageFont.load_default()


def draw_text_with_bg(draw: ImageDraw.ImageDraw,
                      text: str,
                      x: int,
                      y: int,
                      font,
                      text_fill: str,
                      bg_fill: str,
                      box_w: int,
                      padding: int = 8,
                      radius: int = 10):
    """Draw wrapped text with a solid background block for readability."""
    wrapped = textwrap.fill(text, width=max(16, box_w // 18))

    # Measure the wrapped text box
    try:
        left, top, right, bottom = draw.multiline_textbbox((x, y), wrapped, font=font)
    except AttributeError:
        # Fallback for older Pillow
        w, h = draw.multiline_textsize(wrapped, font=font)
        left, top, right, bottom = x, y, x + w, y + h

    left -= padding
    top -= padding
    right += padding
    bottom += padding

    # Draw background block (rounded if available)
    try:
        draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=bg_fill)
    except AttributeError:
        draw.rectangle([left, top, right, bottom], fill=bg_fill)

    # Draw the text on top
    draw.multiline_text((x, y), wrapped, font=font, fill=text_fill)


def get_model_response(model_name: str, prompt: str, config: types.GenerationConfig | None = None) -> str:
    """Return text from a GenerativeModel call, honoring generation_config."""
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(
        contents=prompt,
        generation_config=config,
    )
    # Prefer flattened text if present
    return response.text or ""


def generate_image_from_text(prompt: str, model_name: str = IMAGE_MODEL) -> bytes:
    """Generate an image and return raw bytes suitable for PIL."""
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(contents=prompt)
    return extract_image_bytes_from_response(response)


def assemble_comic_page(panels: list[dict], output_path: Path):
    """Assemble a comic page from panels."""
    page_img = Image.new("RGB", COMIC_SIZE, "white")
    draw = ImageDraw.Draw(page_img)
    font = open_font()

    panel_w = COMIC_SIZE[0] // 2
    panel_h = COMIC_SIZE[1] // 2

    for i, panel in enumerate(panels):
        x = (i % 2) * panel_w
        y = (i // 2) * panel_h

        # Load and place panel image
        try:
            img = Image.open(BytesIO(panel["image_data"]))
            img.load()
        except Exception as e:
            print(f"Warning: failed to open panel image {i+1}: {e}")
            img = Image.new("RGB", (panel_w, panel_h), "#eeeeee")
            d2 = ImageDraw.Draw(img)
            d2.text((10, 10), "Image failed to load", font=font, fill="red")

        img = img.resize((panel_w, panel_h), Image.LANCZOS)
        page_img.paste(img, (x, y))

        # Dialogue (top-left with basic padding)
        if panel.get("dialogue"):
            padding = 10
            text_box_w = panel_w - 2 * padding
            draw_text_with_bg(draw, panel.get("dialogue", ""), x + padding, y + padding, font, text_fill="black", bg_fill="white", box_w=text_box_w)

    page_img.save(output_path)
    print(f"Comic page saved as '{output_path}'")


def generate_comic_with_context(story_idea: str, comic_pages: int = 2, api_key: str = None) -> List[Path]:
    """
    Generate a comic based on the story idea using Gemini AI.
    Returns list of generated comic page file paths.
    """
    print(f"Starting comic generation for: '{story_idea}'")

    # Configure Gemini API
    if api_key:
        genai.configure(api_key=api_key)
    elif not os.environ.get("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY not found. Please set it in your environment or provide it in the request.")

    total_panels = comic_pages * PANELS_PER_PAGE

    # 1) Script (force JSON with exactly total_panels items)
    prompt = f"""
You are an AI comic writer for NASA educational content. Generate a {total_panels}-panel comic script about: {story_idea}.
Return ONLY valid JSON with a top-level key "panels" (a list of {total_panels} objects).
Each object must have:
- "description": an image prompt (concise, visual, no dialogue, scientific/educational focus)
- "dialogue": the spoken line for the panel (educational and engaging)
Example:
{{
  "panels": [
    {{"description": "Astronauts in a space station laboratory, microgravity environment, plants floating in containers, scientific equipment, bright lighting.", "dialogue": "Let's see how plants grow in space!"}}
  ]
}}
"""

    print("Step 1: Generating comic script...")
    config = types.GenerationConfig(response_mime_type="application/json")
    script_text = get_model_response(TEXT_MODEL, prompt, config=config)

    try:
        script = json.loads(script_text)
        panels = script.get("panels", [])
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Model did not return valid JSON: {e}\n---\n{script_text}\n---")

    if not panels:
        raise RuntimeError("No panels generated.")

    # If the model returned fewer than required, pad with the last one
    if len(panels) < total_panels:
        print(f"Warning: model returned {len(panels)} panels, expected {total_panels}. Padding with last panel.")
        while len(panels) < total_panels:
            panels.append(panels[-1])

    # 2) Images
    print("Step 2: Generating images for each panel...")
    comic_panels = []
    for i, p in enumerate(panels[:total_panels]):
        desc = (p.get("description") or "simple comic panel, abstract shapes").strip()
        dial = (p.get("dialogue") or "").strip()
        print(f"  - Panel {i+1}/{total_panels}: {desc}")
        img_prompt = f"{STYLE_HINT}{desc}"
        img_bytes = generate_image_from_text(img_prompt)
        comic_panels.append({"image_data": img_bytes, "dialogue": dial})

    # 3) Assemble pages
    print("Step 3: Assembling comic pages...")
    page_paths = []
    for i in range(comic_pages):
        start = i * PANELS_PER_PAGE
        end = start + PANELS_PER_PAGE
        page_panels = comic_panels[start:end]
        if page_panels:
            page_path = Path(f"comic_page_{i+1}.png")
            assemble_comic_page(page_panels, page_path)
            page_paths.append(page_path)

    print("\nComic generation complete!")
    return page_paths

# -----------------------------
# Request/Response Models
# -----------------------------
class ComicCreateRequest(BaseModel):
    topic: str = Field(
        min_length=3,
        description="The topic for comic creation (will be expanded via RAG context)."
    )
    comic_title: Optional[str] = Field(
        default="NASA Comic",
        description="Display title for the generated comic."
    )
    max_num_chunks: Optional[int] = Field(
        default=3,
        ge=1,
        le=20,
        description="Upper bound on how many retrieved chunks to include in raw context."
    )
    model: Optional[str] = Field(
        default="gemini-2.5-flash",
        description="LLM model name to use for comic generation."
    )
    gemini_api_key: Optional[str] = Field(
        default=None,
        description="Google Gemini API key (if not set in environment)."
    )
    comic_pages: Optional[int] = Field(
        default=2,
        ge=1,
        le=4,
        description="Number of comic pages to generate (2 pages = 8 panels total)."
    )
    include_dialogue: Optional[bool] = Field(
        default=True,
        description="Whether to include speech bubbles and dialogue in the comic."
    )

    @field_validator("topic", mode="after")
    @classmethod
    def topic_strip_after(cls, topic: str) -> str:
        return topic.strip()


class ComicCreateResponse(BaseModel):
    status: Literal["success", "failure"] = Field(description="Operation status")
    message: str = Field(description="Status message")
    comic_path: Optional[str] = Field(
        default=None,
        description="Filesystem path to the generated comic file (server-side)."
    )
    comic_mime_type: Optional[str] = Field(
        default="image/png",
        description="MIME type of the generated comic."
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata about generation, retrieval, and configuration."
    )


class ComicPanel(BaseModel):
    panel_number: int = Field(description="Panel sequence number")
    image_path: Optional[str] = Field(description="Path to panel image")
    dialogue: Optional[str] = Field(description="Text/dialogue for this panel")
    description: Optional[str] = Field(description="Description of what's happening in the panel")


class ComicMetadata(BaseModel):
    title: str = Field(description="Comic title")
    topic: str = Field(description="Original topic")
    total_panels: int = Field(description="Number of panels generated")
    art_style: str = Field(description="Art style used")
    panels: List[ComicPanel] = Field(description="List of comic panels")


# -----------------------------
# Helper: Build raw context from RAG result
# -----------------------------
def _extract_raw_context_from_aquery(result: Dict[str, Any], max_num_chunks: int) -> str:
    """
    Tries to obtain a 'raw_context' from rag.aquery result. If not present,
    gracefully falls back to concatenating top-N chunks' content.
    """
    if not isinstance(result, dict):
        return ""

    # Preferred: if backend returns raw_context directly
    raw_context = result.get("raw_context")
    if isinstance(raw_context, str) and raw_context.strip():
        return raw_context.strip()

    # Fallback: concatenate chunks
    data = result.get("data") or {}
    chunks = data.get("chunks") or []
    texts: List[str] = []
    for c in chunks[: max_num_chunks or 3]:
        content = c.get("content") if isinstance(c, dict) else None
        if isinstance(content, str) and content.strip():
            texts.append(content.strip())
    return "\n\n".join(texts).strip()


# -----------------------------
# Router Factory
# -----------------------------
def create_comic_routes(rag, api_key: Optional[str] = None, output_dir: Optional[str] = None):
    """
    Factory to create comic routes with dependency injection of RAG and API key for auth.
    """
    combined_auth = get_combined_auth_dependency(api_key)
    base_output_dir = Path(output_dir or "./comics").resolve()
    base_output_dir.mkdir(parents=True, exist_ok=True)

    @router.post(
        "/comic",
        response_model=ComicCreateResponse,
        dependencies=[Depends(combined_auth)],
        responses={
            200: {
                "description": "Comic generated successfully",
                "content": {
                    "application/json": {
                        "schema": ComicCreateResponse.model_json_schema(),
                        "examples": {
                            "ok": {
                                "summary": "Successful comic creation",
                                "value": {
                                    "status": "success",
                                    "message": "Comic generated",
                                    "comic_path": "/abs/path/to/comics/2025-10-04/comic_3f2b7b.png",
                                    "comic_mime_type": "image/png",
                                    "metadata": {
                                        "topic": "Effects of microgravity on plant growth",
                                        "title": "Space Plants: A Scientific Adventure",
                                        "total_panels": 6,
                                        "art_style": "scientific",
                                        "model": "gpt-4o-mini",
                                        "retrieval": {
                                            "mode": "mix",
                                            "chunks_used": 3
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: {
                "description": "Bad Request - Invalid input parameters",
                "content": {
                    "application/json": {
                        "schema": {"type": "object", "properties": {"detail": {"type": "string"}}},
                        "example": {"detail": "Topic must be at least 3 characters long"}
                    }
                }
            },
            500: {
                "description": "Internal Server Error - Comic generation failed",
                "content": {
                    "application/json": {
                        "schema": {"type": "object", "properties": {"detail": {"type": "string"}}},
                        "example": {"detail": "Failed to generate comic: Image generation service unavailable"}
                    }
                }
            }
        }
    )
    async def create_comic(request: ComicCreateRequest):
        try:
            # -----------------------------
            # 1) Retrieval with RAG (aquery)
            # -----------------------------
            param = QueryParam(
                mode="mix",
                stream=False,
                include_references=False,
                top_k=request.max_num_chunks or 3,
                chunk_top_k=request.max_num_chunks or 3,
            )
            for k, v in {
                "only_need_context": True,
                "only_need_prompt": False,
                "enable_rerank": False,
                "max_total_tokens": 2000,
                "include_references": False
            }.items():
                try:
                    setattr(param, k, v)
                except Exception:
                    pass

            retrieval_result: Dict[str, Any] = await rag.aquery(request.topic, param=param)

            raw_context = _extract_raw_context_from_aquery(
                retrieval_result, max_num_chunks=request.max_num_chunks or 3
            )
            if not raw_context:
                raw_context = (
                    f"Topic: {request.topic}\n\n"
                    "Please create an educational comic about this topic for a NASA biosciences audience."
                )

            # -----------------------------
            # 2) Generate comic with Gemini AI
            # -----------------------------
            # Date-based output folders you control
            date_folder = (base_output_dir / datetime.utcnow().strftime("%Y-%m-%d")).resolve()
            date_folder.mkdir(parents=True, exist_ok=True)

            # Change to the output directory for comic generation
            original_cwd = os.getcwd()
            os.chdir(date_folder)

            try:
                # Generate comic using the integrated Gemini AI system
                comic_page_paths = generate_comic_with_context(
                    story_idea=raw_context,
                    comic_pages=request.comic_pages or 2,
                    api_key=request.gemini_api_key
                )
                
                # Return the first page (main comic page)
                if comic_page_paths:
                    main_comic_path = comic_page_paths[0]
                    comic_filename = f"comic_{uuid.uuid4().hex[:8]}.png"
                    final_path = date_folder / comic_filename
                    
                    # Copy the first page to a final named file
                    shutil.copy2(main_comic_path, final_path)
                    
                    # -----------------------------
                    # 3) Return the comic file
                    # -----------------------------
                    return FileResponse(
                        path=str(final_path),
                        media_type="image/png",
                        filename=comic_filename,
                    )
                else:
                    raise RuntimeError("No comic pages were generated")
                    
            finally:
                # Restore original working directory
                os.chdir(original_cwd)

        except HTTPException:
            raise
        except Exception as e:
            trace_exception(e)
            raise HTTPException(status_code=500, detail=f"Failed to generate comic: {str(e)}")

    @router.get(
        "/metadata/{comic_id}",
        response_model=ComicMetadata,
        dependencies=[Depends(combined_auth)],
        summary="Get comic metadata",
        description="Retrieve metadata about a generated comic including panel information."
    )
    async def get_comic_metadata(comic_id: str):
        """
        Get metadata for a specific comic by ID.
        This would typically query a database or file system for comic information.
        """
        try:
            # TODO: Implement metadata retrieval logic
            # This would query your storage system for comic metadata
            
            # Placeholder response
            return ComicMetadata(
                title="Sample NASA Comic",
                topic="Space Exploration",
                total_panels=6,
                art_style="scientific",
                panels=[
                    ComicPanel(
                        panel_number=1,
                        image_path="/path/to/panel1.png",
                        dialogue="Welcome to our space adventure!",
                        description="Introduction panel showing astronauts"
                    ),
                    ComicPanel(
                        panel_number=2,
                        image_path="/path/to/panel2.png",
                        dialogue="Let's explore the effects of microgravity!",
                        description="Scientists observing plants in space"
                    )
                ]
            )
            
        except Exception as e:
            trace_exception(e)
            raise HTTPException(status_code=500, detail=f"Failed to retrieve comic metadata: {str(e)}")

    return router
