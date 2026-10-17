import subprocess
import os

DEST_DIR = r"C:\30x\Hackaton octubre 2026\clases"

CLASSES = [
    {
        "order": "01",
        "id": "Djt7qCpg-pk",
        "title": "Strategic Problem Solving",
        "url": "https://www.youtube.com/watch?v=Djt7qCpg-pk"
    },
    {
        "order": "02",
        "id": "3yEb_V8-Tss",
        "title": "Loop Engineering",
        "url": "https://www.youtube.com/watch?v=3yEb_V8-Tss"
    },
    {
        "order": "03",
        "id": "EbztG-aww9I",
        "title": "Demo con Jev - Menos tokens al desarrollar",
        "url": "https://www.youtube.com/watch?v=EbztG-aww9I"
    },
    {
        "order": "04",
        "id": "z8a3AHd7VRQ",
        "title": "Del demo a la implementacion",
        "url": "https://www.youtube.com/watch?v=z8a3AHd7VRQ"
    },
    {
        "order": "05",
        "id": "ByOGwoOrJNM",
        "title": "UX con proposito - IA y primeras versiones",
        "url": "https://www.youtube.com/watch?v=ByOGwoOrJNM"
    },
    {
        "order": "06",
        "id": "WdXQBNzHHIg",
        "title": "Kickoff Oficial - Hackathon 30X",
        "url": "https://www.youtube.com/watch?v=WdXQBNzHHIg"
    }
]

def download_videos():
    os.makedirs(DEST_DIR, exist_ok=True)
    for c in CLASSES:
        filename = f"{c['order']} - {c['title']}.mp4"
        out_path = os.path.join(DEST_DIR, filename)
        if os.path.exists(out_path):
            print(f"[YA EXISTE] {filename}")
            continue
        print(f"\n==========================================")
        print(f"Descargando video: {filename}...")
        print(f"==========================================")
        cmd = [
            "yt-dlp",
            "-f", "bv*[height<=720]+ba/b[height<=720]/b",
            "--merge-output-format", "mp4",
            "--no-playlist",
            "-o", out_path,
            c["url"]
        ]
        ret = subprocess.run(cmd)
        if ret.returncode == 0:
            print(f"[COMPLETADO] {filename}")
        else:
            print(f"[ERROR al descargar] {filename}")

if __name__ == "__main__":
    download_videos()
