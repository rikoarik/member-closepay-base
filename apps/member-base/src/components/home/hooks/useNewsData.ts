/**
 * Shared News Data Hook
 * Hook untuk mendapatkan data news yang sama antara NewsTab dan BerandaNewsInfo
 */
import { useMemo } from 'react';
import { News } from '../news/NewsItem';

const BATCH_SIZE = 20;

const generateNewsBatch = (startIndex: number, count: number): News[] => {
  const titles = [
    'Pembukaan Gedung Baru Kampus',
    'Workshop Teknologi Terkini',
    'Seminar Kewirausahaan',
    'Festival Budaya Lokal',
    'Kompetisi Olahraga Antar Fakultas',
    'Peluncuran Program Beasiswa',
    'Konser Musik Akhir Tahun',
    'Pameran Seni Rupa',
    'Diskusi Panel Isu Terkini',
    'Acara Donor Darah',
  ];

  const descriptions = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ];

  const news: News[] = [];
  const baseDate = new Date();
  baseDate.setFullYear(2024, 0, 1);
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  for (let i = startIndex; i < startIndex + count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    news.push({
      id: String(i + 1),
      title: `${titles[i % titles.length]} ${i + 1}`,
      description: descriptions[i % descriptions.length],
      date: formattedDate,
      imageUrl: `https://picsum.photos/id/${1018 + (i % 20)}/200/200`,
    });
  }

  return news;
};

/**
 * Hook untuk mendapatkan data news
 * @param limit - Jumlah news yang diambil (untuk BerandaNewsInfo, ambil beberapa saja)
 * @param isActive - Apakah tab aktif (untuk optimasi)
 * @param isVisible - Apakah tab visible (untuk optimasi)
 * @param refreshKey - Key untuk force refresh data (ubah nilai ini untuk refresh)
 */
export const useNewsData = (
  limit?: number,
  isActive: boolean = true,
  isVisible: boolean = true,
  refreshKey?: number
): News[] => {
  return useMemo(() => {
    if (!isActive && !isVisible) return [];
    
    // Generate news data
    const news: News[] = [];
    const batchesToLoad = limit ? Math.ceil(limit / BATCH_SIZE) : 1;
    
    for (let i = 0; i < batchesToLoad; i++) {
      const startIndex = i * BATCH_SIZE;
      const count = limit && (i + 1) * BATCH_SIZE > limit 
        ? limit - i * BATCH_SIZE 
        : BATCH_SIZE;
      news.push(...generateNewsBatch(startIndex, count));
    }
    
    // Limit jika ada
    return limit ? news.slice(0, limit) : news;
  }, [limit, isActive, isVisible, refreshKey]); // refreshKey sebagai dependency untuk force refresh
};

