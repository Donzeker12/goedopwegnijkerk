import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface FavoriteButtonProps {
    scooterId: number;
}

export default function FavoriteButton({ scooterId }: FavoriteButtonProps) {
    const { props } = usePage();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isLoggedIn = (props.auth as any)?.user;

    useEffect(() => {
        if (isLoggedIn) {
            // Check database if logged in
            fetch(`/api/favorieten/${scooterId}/check`)
                .then((res) => res.json())
                .then((data) => setIsFavorited(data.is_favorited))
                .catch(() => setIsFavorited(false));
        } else {
            // Check localStorage if not logged in
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorited(favorites.includes(scooterId));
        }
    }, [scooterId, isLoggedIn]);

    const handleToggle = async () => {
        if (!isLoggedIn) {
            // Handle localStorage for non-logged-in users
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (favorites.includes(scooterId)) {
                const updated = favorites.filter((id: number) => id !== scooterId);
                localStorage.setItem('favorites', JSON.stringify(updated));
                setIsFavorited(false);
            } else {
                favorites.push(scooterId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                setIsFavorited(true);
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/favorieten/${scooterId}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
                },
            });

            const data = await response.json();
            setIsFavorited(data.is_favorited);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                isFavorited
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isFavorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
            <span className="text-lg">{isFavorited ? '❤️' : '🤍'}</span>
            <span>{isFavorited ? 'Favoriet' : 'Favoriet'}</span>
        </button>
    );
}
