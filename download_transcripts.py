import subprocess
import os
import re

DEST_DIR = r"C:\30x\Hackaton octubre 2026\clases"

CLASSES = [
    {
        "order": "01",
        "id": "Djt7qCpg-pk",
        "title": "Strategic Problem Solving",
        "date": "2026-10-13",
        "url": "https://www.youtube.com/watch?v=Djt7qCpg-pk"
    },
    {
        "order": "02",
        "id": "3yEb_V8-Tss",
        "title": "Loop Engineering",
        "date": "2026-10-14",
        "url": "https://www.youtube.com/watch?v=3yEb_V8-Tss"
    },
    {
        "order": "03",
        "id": "EbztG-aww9I",
        "title": "Demo con Jev - Usa menos tokens al desarrollar",
        "date": "2026-10-15",
        "url": "https://www.youtube.com/watch?v=EbztG-aww9I"
    },
    {
        "order": "04",
        "id": "z8a3AHd7VRQ",
        "title": "Del demo a la implementacion - Herramientas para tu proyecto",
        "date": "2026-10-15",
        "url": "https://www.youtube.com/watch?v=z8a3AHd7VRQ"
    },
    {
        "order": "05",
        "id": "ByOGwoOrJNM",
        "title": "UX con proposito - Disenar cuando la IA genera versiones",
        "date": "2026-10-16",
        "url": "https://www.youtube.com/watch?v=ByOGwoOrJNM"
    },
    {
        "order": "06",
        "id": "WdXQBNzHHIg",
        "title": "Kickoff Oficial - Hackathon 30X",
        "date": "2026-10-16",
        "url": "https://www.youtube.com/watch?v=WdXQBNzHHIg"
    }
]

def clean_vtt_or_srt(file_path):
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Match SRT style blocks or VTT blocks
    lines = content.splitlines()
    text_entries = []
    seen = set()
    current_time = ""
    
    time_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.,]\d{3})')
    
    for line in lines:
        line = line.strip()
        if not line or line.isdigit() or line == "WEBVTT" or "Kind:" in line or "Language:" in line:
            continue
        m = time_pattern.search(line)
        if m:
            current_time = m.group(1)[:8]
            continue
        
        # Remove vtt formatting tags like <c> </c> or <00:00:00.000>
        clean_text = re.sub(r'<[^>]+>', '', line).strip()
        if clean_text and clean_text not in seen:
            seen.add(clean_text)
            text_entries.append(f"[{current_time}] {clean_text}")

    return "\n".join(text_entries)

def download_transcripts():
    os.makedirs(DEST_DIR, exist_ok=True)
    for c in CLASSES:
        prefix = f"{c['order']} - {c['title']}"
        out_template = os.path.join(DEST_DIR, f"{prefix}.%(ext)s")
        print(f"--> Descargando transcripciones / subtitulos de: {c['title']}...")
        cmd = [
            "yt-dlp",
            "--write-auto-sub",
            "--sub-lang", "es",
            "--skip-download",
            "--convert-subs", "srt",
            "-o", out_template,
            c["url"]
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        print(f"yt-dlp sub result: code {res.returncode}")

        # Check if srt was created
        expected_srt = os.path.join(DEST_DIR, f"{prefix}.es.srt")
        if os.path.exists(expected_srt):
            cleaned = clean_vtt_or_srt(expected_srt)
            if cleaned:
                txt_path = os.path.join(DEST_DIR, f"{prefix} - Transcripcion.txt")
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(f"# {c['title']} ({c['date']})\n")
                    f.write(f"URL: {c['url']}\n\n")
                    f.write(cleaned)
                print(f"Transcripción guardada en: {txt_path}")
        else:
            print(f"No se encontró subtitulo directo para {prefix}")

if __name__ == "__main__":
    download_transcripts()
