import { blobatar } from 'blobatar';

export function obtenerUrlAvatar(nombre: string | undefined): string {
  const seed = nombre ? nombre.trim() : 'default';
  
  const svgString = blobatar(seed);

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}