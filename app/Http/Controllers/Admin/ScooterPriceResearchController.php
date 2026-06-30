<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scooter;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class ScooterPriceResearchController extends Controller
{
    public function estimate(Scooter $scooter): JsonResponse
    {
        $apiKey = (string) config('services.serpapi.api_key');

        if ($apiKey === '') {
            return response()->json([
                'error' => 'SerpAPI sleutel ontbreekt. Voeg SERPAPI_API_KEY toe aan je .env bestand.',
                'configured' => false,
            ], 503);
        }

        $scooter->loadMissing(['brand', 'scooterModel']);

        $baseName = trim((string) ($scooter->brand?->name . ' ' . $scooter->scooterModel?->name));
        if ($baseName === '') {
            $baseName = (string) $scooter->display_name;
        }

        $newPriceQuery = $baseName . ' scooter nieuwprijs';
        $marketQuery = $baseName . ' scooter tweedehands marktplaats';

        try {
            $newPayload = $this->searchSerpApi($newPriceQuery, $apiKey);
            $marketPayload = $this->searchSerpApi($marketQuery, $apiKey);

            $newPrices = $this->extractPrices($newPayload);
            $marketPrices = $this->extractPrices($marketPayload);

            $marketSummary = $this->summarizePrices($marketPrices);

            return response()->json([
                'configured' => true,
                'scooter' => $baseName,
                'queries' => [
                    'new_price' => $newPriceQuery,
                    'market' => $marketQuery,
                ],
                'new_price' => [
                    'count' => count($newPrices),
                    'summary' => $this->summarizePrices($newPrices),
                    'sources' => $this->extractSources($newPayload),
                ],
                'market' => [
                    'count' => count($marketPrices),
                    'summary' => $marketSummary,
                    'sources' => $this->extractSources($marketPayload),
                ],
                'suggested_price_range' => $marketSummary
                    ? [
                        'low' => $marketSummary['p25'],
                        'high' => $marketSummary['p75'],
                        'median' => $marketSummary['median'],
                    ]
                    : null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Prijsanalyse ophalen mislukt: ' . $e->getMessage(),
                'configured' => true,
            ], 500);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function searchSerpApi(string $query, string $apiKey): array
    {
        $response = Http::timeout(15)->get('https://serpapi.com/search.json', [
            'engine' => 'google',
            'google_domain' => 'google.nl',
            'hl' => 'nl',
            'gl' => 'nl',
            'num' => 20,
            'q' => $query,
            'api_key' => $apiKey,
        ]);

        if (! $response->ok()) {
            throw new \RuntimeException('Externe zoekdienst gaf status ' . $response->status());
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            throw new \RuntimeException('Ongeldig antwoord van zoekdienst.');
        }

        return $payload;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<int, float>
     */
    private function extractPrices(array $payload): array
    {
        $values = [];

        foreach ((array) ($payload['shopping_results'] ?? []) as $item) {
            $price = is_array($item) ? ($item['price'] ?? null) : null;
            $parsed = $this->parseEuroAmount(is_scalar($price) ? (string) $price : null);
            if ($parsed !== null) {
                $values[] = $parsed;
            }
        }

        foreach ((array) ($payload['inline_shopping_results'] ?? []) as $item) {
            $price = is_array($item) ? ($item['price'] ?? null) : null;
            $parsed = $this->parseEuroAmount(is_scalar($price) ? (string) $price : null);
            if ($parsed !== null) {
                $values[] = $parsed;
            }
        }

        foreach ((array) ($payload['organic_results'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }

            $text = implode(' ', array_filter([
                is_scalar($item['title'] ?? null) ? (string) $item['title'] : '',
                is_scalar($item['snippet'] ?? null) ? (string) $item['snippet'] : '',
                is_scalar($item['rich_snippet']['top']['detected_extensions'][0]['value'] ?? null)
                    ? (string) $item['rich_snippet']['top']['detected_extensions'][0]['value']
                    : '',
            ]));

            if (preg_match_all('/(?:EUR|€)\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/iu', $text, $matches)) {
                foreach ($matches[1] as $raw) {
                    $parsed = $this->parseEuroAmount($raw);
                    if ($parsed !== null) {
                        $values[] = $parsed;
                    }
                }
            }
        }

        $values = array_values(array_filter($values, fn (float $value) => $value >= 100 && $value <= 30000));

        sort($values);

        return $values;
    }

    private function parseEuroAmount(?string $raw): ?float
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        $normalized = str_replace(['EUR', '€', ' '], '', strtoupper($raw));
        $normalized = str_replace('.', '', $normalized);
        $normalized = str_replace(',', '.', $normalized);

        if (! is_numeric($normalized)) {
            return null;
        }

        return round((float) $normalized, 2);
    }

    /**
     * @param array<int, float> $prices
     * @return array<string, float>|null
     */
    private function summarizePrices(array $prices): ?array
    {
        if ($prices === []) {
            return null;
        }

        sort($prices);

        return [
            'min' => round((float) min($prices), 2),
            'max' => round((float) max($prices), 2),
            'average' => round(array_sum($prices) / count($prices), 2),
            'median' => round($this->percentile($prices, 0.5), 2),
            'p25' => round($this->percentile($prices, 0.25), 2),
            'p75' => round($this->percentile($prices, 0.75), 2),
        ];
    }

    /**
     * @param array<int, float> $sorted
     */
    private function percentile(array $sorted, float $p): float
    {
        $count = count($sorted);
        if ($count === 1) {
            return $sorted[0];
        }

        $index = ($count - 1) * $p;
        $lower = (int) floor($index);
        $upper = (int) ceil($index);

        if ($lower === $upper) {
            return $sorted[$lower];
        }

        $weight = $index - $lower;

        return $sorted[$lower] + (($sorted[$upper] - $sorted[$lower]) * $weight);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<int, array{title:string,link:string,snippet:string}>
     */
    private function extractSources(array $payload): array
    {
        $sources = [];

        foreach ((array) ($payload['organic_results'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }

            $title = is_scalar($item['title'] ?? null) ? (string) $item['title'] : '';
            $link = is_scalar($item['link'] ?? null) ? (string) $item['link'] : '';
            $snippet = is_scalar($item['snippet'] ?? null) ? (string) $item['snippet'] : '';

            if ($title === '' || $link === '') {
                continue;
            }

            $sources[] = [
                'title' => $title,
                'link' => $link,
                'snippet' => $snippet,
            ];

            if (count($sources) >= 8) {
                break;
            }
        }

        return $sources;
    }
}
