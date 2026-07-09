# Room file folders go here.
#
# 1. In admin, copy the room slug shown for the room.
# 2. Create ebooks/collab/files/<slug>/
# 3. Copy @upload.bat.template to that folder as @upload.bat
# 4. Put audio/video/markdown/txt files in the folder (one level only).
# 5. Right-click @upload.bat -> Run to sync to GitHub Pages.
#
# The sync writes manifest.json and mirrors the folder to:
#   https://gflhfy.github.io/collab/files/<slug>/
#
# @upload.bat skips itself. Remote files not present locally are removed.
