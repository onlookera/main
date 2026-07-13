import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_HEIGHT_PX = 1123;
const SCALE = 2;

export async function exportToPDF(
  previewElement: HTMLElement,
  fileName: string = '简历.pdf'
): Promise<void> {
  const paper = previewElement.querySelector('.a4-paper') as HTMLElement;
  if (!paper) {
    alert('没有找到简历内容');
    return;
  }

  // 一次性渲染整个长页面
  const fullCanvas = await html2canvas(paper, {
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const canvasW = fullCanvas.width;
  const canvasH = fullCanvas.height;
  const pageHpx = A4_HEIGHT_PX * SCALE; // 每页在 canvas 中的高度
  const pageCount = Math.ceil(canvasH / pageHpx);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pageCount; i++) {
    const sy = i * pageHpx;
    const sh = Math.min(pageHpx, canvasH - sy);

    // 从大 canvas 裁剪当前页
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasW;
    pageCanvas.height = sh;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, sh);
    ctx.drawImage(fullCanvas, 0, sy, canvasW, sh, 0, 0, canvasW, sh);

    if (i > 0) pdf.addPage();

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.92);
    const imgHmm = (sh * A4_WIDTH_MM) / canvasW;
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, Math.min(imgHmm, A4_HEIGHT_MM));
  }

  pdf.save(fileName);
}
