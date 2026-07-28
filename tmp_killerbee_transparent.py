from PIL import Image
from collections import deque
import os

src = r"c:\xampp\htdocs\goedopwegnijkerk\public\storage\scooters\killerbee.jpeg"
out = r"c:\xampp\htdocs\goedopwegnijkerk\storage\app\public\scooters\killerbee_transparant.png"

img = Image.open(src).convert("RGBA")
pix = img.load()
w, h = img.size

visited = [[False]*h for _ in range(w)]
q = deque()

def is_bg(r,g,b,a):
    if a < 10:
        return True
    mx = max(r,g,b)
    mn = min(r,g,b)
    sat = mx - mn
    return (r >= 225 and g >= 225 and b >= 225 and sat <= 24)

for x in range(w):
    q.append((x,0)); q.append((x,h-1))
for y in range(h):
    q.append((0,y)); q.append((w-1,y))

while q:
    x,y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h:
        continue
    if visited[x][y]:
        continue
    visited[x][y] = True
    r,g,b,a = pix[x,y]
    if not is_bg(r,g,b,a):
        continue
    pix[x,y] = (r,g,b,0)
    q.append((x+1,y)); q.append((x-1,y)); q.append((x,y+1)); q.append((x,y-1))

for y in range(1,h-1):
    for x in range(1,w-1):
        r,g,b,a = pix[x,y]
        if a == 0:
            continue
        if r > 236 and g > 236 and b > 236:
            n = [pix[x+1,y][3], pix[x-1,y][3], pix[x,y+1][3], pix[x,y-1][3]]
            if min(n) == 0:
                pix[x,y] = (r,g,b,120)

os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out, "PNG")
print(out)
