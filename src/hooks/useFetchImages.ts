import { useState, useCallback, useRef } from 'react';
import { PicsumImage } from '../types/gallery';

export const useFetchImages = () => {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Guard flag using useRef to strictly prevent parallel duplicate calls
  const isFetchingRef = useRef(false);

  const fetchImages = useCallback(async (pageNum: number, isRefresh = false) => {
    // Prevent duplicate calls if already fetching
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNum}&limit=20`);
      const data = await response.json();

      setImages((prev) => (isRefresh ? data : [...prev, ...data]));
    } catch (error) {
      console.error('API Fetch Error:', error);
    } finally {
      isFetchingRef.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (isFetchingRef.current) return; // Guard duplicate pull gesture
    setRefreshing(true);
    setPage(1);
    fetchImages(1, true);
  }, [fetchImages]);

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(nextPage);
  }, [page, fetchImages, loading]);

  // Initial load
  useCallback(() => {
    fetchImages(1);
  }, [fetchImages]); // Need to call this from component or use useEffect there.

  return { images, refreshing, loading, handleRefresh, loadMore, fetchImages };
};
