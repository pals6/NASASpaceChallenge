"""
This module contains all podcast-related routes for the NASAChallenge API.
"""

import os
import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
import uuid

from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from lightrag.base import QueryParam
from lightrag.api.utils_api import get_combined_auth_dependency

from ascii_colors import trace_exception

# 3rd party podcast generator
from podcastfy.client import generate_podcast

router = APIRouter(tags=["podcast"])

# -----------------------------
# Request/Response Models
# -----------------------------
class PodcastCreateRequest(BaseModel):
    topic: str = Field(
        min_length=3,
        description="The topic for podcast creation (will be expanded via RAG context)."
    )
    max_words: Optional[int] = Field(
        default=100,
        ge=50,
        le=4000,
        description="Maximum number of words to target for the generated podcast transcript/content."
    )
    conversation_style: Optional[List[Literal["casual", "educative", "debate", "storytelling"]]] = Field(
        default=["casual", "educative"],
        description="Conversation style(s) for the generated podcast."
    )
    creativity: Optional[float] = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Creativity/temperature control for generation (0.0 = deterministic, 1.0 = creative)."
    )
    podcast_name: Optional[str] = Field(
        default="NASA Podcast",
        description="Display name for the generated podcast show."
    )
    max_num_chunks: Optional[int] = Field(
        default=3,
        ge=1,
        le=20,
        description="Upper bound on how many retrieved chunks to include in raw context."
    )
    model: Optional[str] = Field(
        default="gpt-4o-mini",
        description="LLM model name to use within Podcastfy."
    )

    @field_validator("topic", mode="after")
    @classmethod
    def topic_strip_after(cls, topic: str) -> str:
        return topic.strip()


class PodcastCreateResponse(BaseModel):
    status: Literal["success", "failure"] = Field(description="Operation status")
    message: str = Field(description="Status message")
    audio_path: Optional[str] = Field(
        default=None,
        description="Filesystem path to the generated audio file (server-side)."
    )
    audio_mime_type: Optional[str] = Field(
        default="audio/mpeg",
        description="MIME type of the generated audio."
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata about generation, retrieval, and configuration."
    )


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
def create_podcast_routes(rag, api_key: Optional[str] = None, output_dir: Optional[str] = None):
    """
    Factory to create podcast routes with dependency injection of RAG and API key for auth.
    """
    combined_auth = get_combined_auth_dependency(api_key)
    base_output_dir = Path(output_dir or "./podcasts").resolve()
    base_output_dir.mkdir(parents=True, exist_ok=True)

    @router.post(
        "/",
        response_model=PodcastCreateResponse,
        dependencies=[Depends(combined_auth)],
        responses={
            200: {
                "description": "Podcast generated successfully",
                "content": {
                    "application/json": {
                        "schema": PodcastCreateResponse.model_json_schema(),
                        "examples": {
                            "ok": {
                                "summary": "Successful podcast creation",
                                "value": {
                                    "status": "success",
                                    "message": "Podcast generated",
                                    "audio_path": "/abs/path/to/podcasts/2025-10-04/podcast_3f2b7b.mp3",
                                    "audio_mime_type": "audio/mpeg",
                                    "metadata": {
                                        "topic": "Effects of microgravity on plant growth",
                                        "word_count": 300,
                                        "conversation_style": ["casual", "educative"],
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
                "description": "Internal Server Error - Podcast generation failed",
                "content": {
                    "application/json": {
                        "schema": {"type": "object", "properties": {"detail": {"type": "string"}}},
                        "example": {"detail": "Failed to generate podcast: LLM service unavailable"}
                    }
                }
            }
        }
    )

    @router.post(
        "/", 
        dependencies=[Depends(combined_auth)]
    )
    async def create_podcast(request: PodcastCreateRequest):
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
                    "Please discuss this topic in detail for a NASA biosciences audience."
                )

            # -----------------------------
            # 2) Generate podcast audio with Podcastfy (returns a *path*)
            # -----------------------------
            # Date-based output folders you control
            date_folder = (base_output_dir / datetime.utcnow().strftime("%Y-%m-%d")).resolve()
            (date_folder / "transcripts").mkdir(parents=True, exist_ok=True)

            custom_config = {
                "word_count": int(request.max_words or 100),
                "conversation_style": request.conversation_style or ["casual", "educative"],
                "podcast_name": request.podcast_name or "NASA Podcast",
                "creativity": float(request.creativity or 0.7),
                "max_num_chunks": int(request.max_num_chunks or 3),

                # Tell Podcastfy where to save files
                "text_to_speech": {
                    "output_directories": {
                        "audio": str(date_folder),
                        "transcripts": str(date_folder / "transcripts"),
                    },
                    "default_tts_model": "openai",
                },
            }

            # IMPORTANT: podcastfy returns the final audio *path*, not bytes
            audio_path_str = generate_podcast(
                text=raw_context,
                llm_model_name=request.model or "gpt-4o-mini",  # used for writing conversation
                tts_model="openai",                              # explicit TTS backend
                api_key_label="OPENAI_API_KEY",                 # env var name, not the key itself
                conversation_config=custom_config,
            )

            if not audio_path_str or not isinstance(audio_path_str, str):
                raise RuntimeError("Podcastfy did not return an audio path")

            audio_path = Path(audio_path_str).resolve()
            if not audio_path.exists() or audio_path.suffix.lower() not in {".mp3", ".wav", ".m4a"}:
                raise RuntimeError(f"Audio file not found or invalid: {audio_path_str}")

            # Optional: rename to a friendly name you control (keeps saving in your folder)
            # (Podcastfy may already name it; if you want a custom filename, move it.)
            if audio_path.parent != date_folder:
                # Shouldn’t happen if output_directories worked, but just in case
                audio_path = audio_path.rename(date_folder / audio_path.name)

            # You asked to "also save it in folder": already done above (Podcastfy wrote it to date_folder)

            # -----------------------------
            # 3) Return the audio file directly
            # -----------------------------
            fname = f"podcast_{uuid.uuid4().hex[:8]}{audio_path.suffix.lower()}"
            # If you'd rather not rename on disk, just use Content-Disposition with a download name:
            return FileResponse(
                path=str(audio_path),
                media_type="audio/mpeg",
                filename=fname,  # sets Content-Disposition; browser can play inline or download
            )

        except HTTPException:
            raise
        except Exception as e:
            trace_exception(e)
            raise HTTPException(status_code=500, detail=f"Failed to generate podcast: {str(e)}")

    return router
