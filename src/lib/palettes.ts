export type Palette = {
  id: string;
  colors: [string, string, string, string];
  likes: number;
  createdAt: string; // ISO string date
};

export const mockPalettes: Palette[] = [
  { id: '1', colors: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9'], likes: 125, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', colors: ['#d63031', '#ff7675', '#fab1a0', '#ffeaa7'], likes: 342, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', colors: ['#0984e3', '#74b9ff', '#a29bfe', '#81ecec'], likes: 88, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', colors: ['#00b894', '#55efc4', '#81ecec', '#74b9ff'], likes: 210, createdAt: new Date().toISOString() },
  { id: '5', colors: ['#6c5ce7', '#a29bfe', '#b8b8f2', '#e0e0f8'], likes: 450, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', colors: ['#fd79a8', '#f8a5c2', '#f9c5d1', '#fce4ec'], likes: 95, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '7', colors: ['#e17055', '#fab1a0', '#ffddc1', '#f9e79f'], likes: 180, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '8', colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'], likes: 520, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '9', colors: ['#f1c40f', '#f39c12', '#e67e22', '#d35400'], likes: 330, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '10', colors: ['#1abc9c', '#16a085', '#2ecc71', '#27ae60'], likes: 600, createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '11', colors: ['#3498db', '#2980b9', '#3498db', '#5dade2'], likes: 128, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '12', colors: ['#9b59b6', '#8e44ad', '#9b59b6', '#af7ac5'], likes: 240, createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '13', colors: ['#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d'], likes: 75, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '14', colors: ['#e74c3c', '#c0392b', '#e74c3c', '#f1948a'], likes: 410, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '15', colors: ['#ffaf40', '#ff9f1a', '#ff8f00', '#fbc531'], likes: 190, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '16', colors: ['#4834d4', '#30336b', '#130f40', '#000000'], likes: 800, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '17', colors: ['#222f3e', '#576574', '#c8d6e5', '#f1f2f6'], likes: 145, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '18', colors: ['#ff6b81', '#ff4757', '#e056fd', '#be2edd'], likes: 280, createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '19', colors: ['#1dd1a1', '#10ac84', '#00d2d3', '#01a3a4'], likes: 310, createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '20', colors: ['#feca57', '#ff9f43', '#ff9f43', '#ee5253'], likes: 220, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
];
