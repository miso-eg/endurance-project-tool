import json, math
from pathlib import Path
source=json.loads(Path('prefectures-source.geojson').read_text(encoding='utf-8'))
names='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()
def simplify(points, eps=.018):
    if len(points)<3:return points
    ax,ay=points[0];bx,by=points[-1];dx=bx-ax;dy=by-ay;den=dx*dx+dy*dy
    maximum=0;idx=0
    for i,(x,y) in enumerate(points[1:-1],1):
        t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/den)) if den else 0
        dist=(x-ax-t*dx)**2+(y-ay-t*dy)**2
        if dist>maximum:maximum=dist;idx=i
    if maximum>eps*eps:return simplify(points[:idx+1],eps)[:-1]+simplify(points[idx:],eps)
    return [points[0],points[-1]]
result=[]
for idx,f in enumerate(source['features']):
    polygons=f['geometry']['coordinates']
    if f['geometry']['type']=='Polygon':polygons=[polygons]
    rings=[]
    for polygon in polygons:
        ring=polygon[0]
        if idx==46:
            if not any(126.5<x<129 and 26<y<28 for x,y in ring):continue
        elif not any(128<x<146.5 and 30<y<46 for x,y in ring):continue
        # Keep the major islands and enough small islands for a readable outline.
        area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:])))/2
        if area<.0015:continue
        simple=simplify(ring)
        if len(simple)<4:continue
        projected=[]
        for x,y in simple:
            if idx==46:x,y=x+12,y+4
            projected.append([round((x-128)*.8*50,2),round((46-y)*50,2)])
        rings.append(projected)
    assert rings,names[idx]
    result.append({'name':names[idx],'rings':rings})
Path('map-data.js').write_text('// Simplified from piuccio/open-data-jp-prefectures-geojson (MIT). See MAP-LICENSE.txt and README.md.\nconst JAPAN_MAP = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Generated',len(result),'prefectures;',Path('map-data.js').stat().st_size,'bytes')
