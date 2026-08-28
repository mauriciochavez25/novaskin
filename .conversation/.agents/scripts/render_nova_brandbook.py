import fitz, os
pdf='attached_assets/Brandbook_NOVA_1787939694092.pdf'
out='.agents/outputs/nova-brandbook-pages'
os.makedirs(out, exist_ok=True)
doc=fitz.open(pdf)
print('pages', doc.page_count)
print('metadata', doc.metadata)
for i in range(doc.page_count):
    page=doc[i]
    pix=page.get_pixmap(matrix=fitz.Matrix(1.15,1.15), alpha=False)
    path=f'{out}/page-{i+1:02d}.png'
    pix.save(path)
print('rendered', doc.page_count)
