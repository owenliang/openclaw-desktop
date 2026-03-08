export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractBase64Parts(dataUrl: string): { mediaType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mediaType: match[1], data: match[2] };
  }
  return { mediaType: 'image/png', data: dataUrl.replace(/^data:[^;]+;base64,/, '') };
}
