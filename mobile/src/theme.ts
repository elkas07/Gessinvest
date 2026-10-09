export const colors = {
  primary: '#2c3e50',
  accent: '#3498db',
  bg: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  muted: '#7f8c8d',
  danger: '#c0392b',
  success: '#27ae60',
};

export const money = (n: number | null | undefined) =>
  `${Math.round(Number(n || 0)).toLocaleString('fr-FR')} FCFA`;
