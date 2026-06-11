<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\PurchaseEntry;
use App\Models\ScooterColorRequest;
use App\Models\ScooterPart;
use App\Models\ScooterTestRideRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PwaController extends Controller
{
    public function hub(): Response
    {
        $openPayments = PurchaseEntry::query()
            ->where('payment_status', 'open')
            ->orderByRaw('due_date IS NULL', [])
            ->orderBy('due_date', 'asc')
            ->orderByDesc('id')
            ->limit(8)
            ->get(['id', 'description', 'amount', 'due_date']);

        $activeChats = ChatSession::query()
            ->where(function ($query) {
                $query->where('status', 'nieuw')
                    ->orWhere('status', 'open');
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(8)
            ->get(['id', 'name', 'status', 'last_message_at', 'created_at']);

        $lowStockCount = ScooterPart::query()
            ->where('minimum_stock', '>', 0)
            ->whereRaw('quantity <= minimum_stock', [], 'and')
            ->count('*');

        return Inertia::render('admin/start', [
            'summary' => [
                'new_chats_count' => (int) ChatSession::query()->where('status', 'nieuw')->count('*'),
                'new_color_requests_count' => (int) ScooterColorRequest::query()->where('status', 'nieuw')->count('*'),
                'new_test_ride_requests_count' => (int) ScooterTestRideRequest::query()->where('status', 'nieuw')->count('*'),
                'open_payments_count' => (int) PurchaseEntry::query()->where('payment_status', 'open')->count('*'),
                'open_payments_total' => (float) PurchaseEntry::query()->where('payment_status', 'open')->sum('amount'),
                'low_stock_count' => (int) $lowStockCount,
            ],
            'open_payments' => $openPayments->map(fn (PurchaseEntry $entry) => [
                'id' => $entry->id,
                'description' => $entry->description,
                'amount' => (float) $entry->amount,
                'due_date' => $entry->due_date?->format('Y-m-d'),
            ]),
            'active_chats' => $activeChats->map(fn (ChatSession $session) => [
                'id' => $session->id,
                'name' => $session->name,
                'status' => $session->status,
                'last_message_at' => $session->last_message_at?->format('Y-m-d H:i'),
                'created_at' => $session->created_at?->format('Y-m-d H:i'),
            ]),
            'can_manage_finance' => (bool) request()->user()?->canManageFinance(),
        ]);
    }

    public function notifications(): JsonResponse
    {
        try {
            $latestChatId = (int) ChatSession::query()->max('id');
            $latestColorRequestId = (int) ScooterColorRequest::query()->max('id');
            $latestTestRideRequestId = (int) ScooterTestRideRequest::query()->max('id');

            return response()->json([
                'counts' => [
                    'new_chats' => (int) ChatSession::query()->where('status', 'nieuw')->count('*'),
                    'new_color_requests' => (int) ScooterColorRequest::query()->where('status', 'nieuw')->count('*'),
                    'new_test_ride_requests' => (int) ScooterTestRideRequest::query()->where('status', 'nieuw')->count('*'),
                    'open_payments' => (int) PurchaseEntry::query()->where('payment_status', 'open')->count('*'),
                ],
                'latest' => [
                    'chat_id' => $latestChatId,
                    'color_request_id' => $latestColorRequestId,
                    'test_ride_request_id' => $latestTestRideRequestId,
                ],
                'generated_at' => now()->toIso8601String(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Admin notifications polling failed; returning safe fallback payload.', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'counts' => [
                    'new_chats' => 0,
                    'new_color_requests' => 0,
                    'new_test_ride_requests' => 0,
                    'open_payments' => 0,
                ],
                'latest' => [
                    'chat_id' => 0,
                    'color_request_id' => 0,
                    'test_ride_request_id' => 0,
                ],
                'generated_at' => now()->toIso8601String(),
            ]);
        }
    }
}
