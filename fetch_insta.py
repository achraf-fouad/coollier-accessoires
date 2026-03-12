import urllib.request
import re

url = "https://www.picuki.com/profile/coollier_accessoires"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    images = re.findall(r'src=\"(https://[^"]+picuki\.com/[^"]+\.jpg[^\"]*)\"', html)
    print("IMAGES_FOUND:")
    for img in images[:6]:
        print(img)
except Exception as e:
    print(e)
