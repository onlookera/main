import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_HEIGHT_PX = 1123;

export async function exportToPDF(
  previewElement: HTMLElement,
  fileName: string = '简历.pdf'
): Promise<void> {
  // 找唯一的 A4 长容器
  const paper = previewElement.querySelector('.a4-paper') as HTMLElement;
  if (!paper) {
    alert('没有找到简历内容');
    return;
  }

  // 渲染整个长页面
  const fullCanvas = await html2canvas(paper, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const totalH = fullCanvas.height;
  const pageCount = Math.ceil(totalH / (A4_HEIGHT_PX * 3)); // *3 because scale=3

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < pageCount; i++) {
    const sy = i * A4_HEIGHT_PX * 3; // source y in canvas pixels
    const sh = Math.min(A4_HEIGHT_PX * 3, totalH - sy); // source height

    // 创建页面画布
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = fullCanvas.width;
    pageCanvas.height = sh;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(fullCanvas, 0, sy, fullCanvas.width, sh, 0, 0, fullCanvas.width, sh);

    if (i > 0) pdf.addPage();

    const imgData = pageCanvas.toDataURL('image/png');
    const imgHmm = (sh * A4_WIDTH_MM) / fullCanvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, Math.min(imgHmm, A4_HEIGHT_MM));
  }

  pdf.save(fileName);
}
