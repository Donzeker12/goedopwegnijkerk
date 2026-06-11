<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\GoogleImageController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PageContentController;
use App\Http\Controllers\Admin\PushSubscriptionController;
use App\Http\Controllers\Admin\PwaController;
use App\Http\Controllers\Admin\ScooterController;
use App\Http\Controllers\Admin\ScooterPartController;
use App\Http\Controllers\Admin\ScooterPhotoController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocationLandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use App\Models\BlogPost;
use App\Models\Scooter;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/over-ons', [AboutController::class, 'index'])->name('about');
Route::get('/faq', [FaqController::class, 'index'])->name('faq');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{post}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
Route::post('/chat-aanvraag', [ChatController::class, 'store'])->name('chat.store')->middleware('throttle:10,1');
Route::get('/chat/{token}', [ChatController::class, 'room'])->name('chat.room');
Route::post('/chat/{token}/bericht', [ChatController::class, 'storeRoomMessage'])->name('chat.room.message')->middleware('throttle:30,1');
Route::get('/scooters', [ShopController::class, 'index'])->name('shop.index');
Route::get('/scooters/{scooter}', [ShopController::class, 'show'])->name('shop.show');
Route::get('/scooter-kopen-in-{city}', [LocationLandingController::class, 'show'])->name('seo.location.show');
Route::post('/scooters/{scooter}/kleur-aanvraag', [ShopController::class, 'storeColorRequest'])->name('shop.color-request.store');
Route::post('/scooters/{scooter}/proefrit-aanvraag', [ShopController::class, 'storeTestRideRequest'])->name('shop.test-ride-request.store');

Route::get('/sitemap.xml', function () {
    $urls = collect([
        url('/'),
        url('/scooters'),
        url('/over-ons'),
        url('/faq'),
        url('/blog'),
        url('/chat'),
    ]);

    $scooterUrls = Scooter::query()
        ->where('ready_for_sale', true)
        ->where('status', 'te_koop')
        ->pluck('id')
        ->map(fn (int $id) => url('/scooters/' . $id));

    $blogUrls = BlogPost::query()
        ->where('is_published', true)
        ->where('published_at', '!=', null)
        ->pluck('slug')
        ->map(fn (string $slug) => url('/blog/' . $slug));

    $cityUrls = collect(array_keys(config('seo.city_pages', [])))
        ->map(fn (string $citySlug) => url('/scooter-kopen-in-' . $citySlug));

    $xml = view('sitemap', [
        'urls' => $urls->merge($scooterUrls)->merge($blogUrls)->merge($cityUrls)->unique()->values(),
    ])->render();

    return response($xml, 200)->header('Content-Type', 'application/xml');
})->name('sitemap');

// Auth routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profiel', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profiel/wachtwoord', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});

// Admin routes (protected)
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/start', [PwaController::class, 'hub'])->name('start');
    Route::get('/notifications', [PwaController::class, 'notifications'])->name('notifications');
    Route::get('/push', [PushSubscriptionController::class, 'index'])->name('push.index');
    Route::post('/push/subscriptions', [PushSubscriptionController::class, 'store'])->name('push.subscriptions.store');
    Route::delete('/push/subscriptions', [PushSubscriptionController::class, 'destroy'])->name('push.subscriptions.destroy');
    Route::delete('/push/subscriptions/{subscription}', [PushSubscriptionController::class, 'destroyManaged'])->name('push.subscriptions.destroy-managed');

    // Scooter CRUD
    Route::get('/scooters', [ScooterController::class, 'index'])->name('scooters.index');
    Route::get('/scooters/nieuw', [ScooterController::class, 'create'])->name('scooters.create');
    Route::post('/scooters', [ScooterController::class, 'store'])->name('scooters.store');
    Route::get('/scooters/{scooter}/bewerken', [ScooterController::class, 'edit'])->name('scooters.edit');
    Route::put('/scooters/{scooter}', [ScooterController::class, 'update'])->name('scooters.update');
    Route::delete('/scooters/{scooter}', [ScooterController::class, 'destroy'])->name('scooters.destroy');

    // Parts
    Route::post('/scooters/{scooter}/onderdelen', [ScooterPartController::class, 'store'])->name('scooters.parts.store');
    Route::patch('/scooters/{scooter}/onderdelen/{part}/status', [ScooterPartController::class, 'updateStatus'])->name('scooters.parts.status');
    Route::delete('/scooters/{scooter}/onderdelen/{part}', [ScooterPartController::class, 'destroy'])->name('scooters.parts.destroy');

    // Photos
    Route::post('/scooters/{scooter}/fotos', [ScooterPhotoController::class, 'store'])->name('scooters.photos.store');
    Route::patch('/scooters/{scooter}/fotos/{photo}/primair', [ScooterPhotoController::class, 'setPrimary'])->name('scooters.photos.primary');
    Route::delete('/scooters/{scooter}/fotos/{photo}', [ScooterPhotoController::class, 'destroy'])->name('scooters.photos.destroy');

    // Google image search (admin only)
    Route::get('/scooters/{scooter}/google-fotos', [GoogleImageController::class, 'search'])->name('scooters.google.search');
    Route::post('/scooters/{scooter}/google-fotos/importeer', [GoogleImageController::class, 'import'])->name('scooters.google.import');

    // Brands & Models
    Route::post('/merken', [BrandController::class, 'store'])->name('brands.store');
    Route::post('/merken/{brand}/modellen', [BrandController::class, 'storeModel'])->name('brands.models.store');

    // Blog
    Route::get('/blog', [AdminBlogController::class, 'index'])->name('blog.index');
    Route::get('/blog/nieuw', [AdminBlogController::class, 'create'])->name('blog.create');
    Route::post('/blog', [AdminBlogController::class, 'store'])->name('blog.store');
    Route::get('/blog/{post}/bewerken', [AdminBlogController::class, 'edit'])->name('blog.edit');
    Route::put('/blog/{post}', [AdminBlogController::class, 'update'])->name('blog.update');
    Route::delete('/blog/{post}', [AdminBlogController::class, 'destroy'])->name('blog.destroy');
    Route::post('/blog/{post}/fotos', [AdminBlogController::class, 'uploadPhotos'])->name('blog.photos.store');
    Route::patch('/blog/{post}/fotos/{photo}/cover', [AdminBlogController::class, 'setCover'])->name('blog.photos.cover');
    Route::delete('/blog/{post}/fotos/{photo}', [AdminBlogController::class, 'destroyPhoto'])->name('blog.photos.destroy');

    // Chat
    Route::get('/chat', [AdminChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{session}', [AdminChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{session}/bericht', [AdminChatController::class, 'storeMessage'])->name('chat.message.store');
    Route::post('/chat/{session}/afspraak-bevestigen', [AdminChatController::class, 'sendAppointmentConfirmation'])->name('chat.appointment.confirm');
    Route::patch('/chat/{session}/status', [AdminChatController::class, 'updateStatus'])->name('chat.status.update');

    // Finance
    Route::get('/financien', [FinanceController::class, 'index'])->name('finance.index');
    Route::post('/financien/inkopen', [FinanceController::class, 'store'])->name('finance.purchases.store');
    Route::patch('/financien/inkopen/{entry}/betaald', [FinanceController::class, 'markPaid'])->name('finance.purchases.paid');
    Route::patch('/financien/gebruikersrol', [FinanceController::class, 'updateAdminRole'])->name('finance.users.role');

    // Inventory
    Route::get('/voorraad', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/voorraad/geplaatst', [InventoryController::class, 'installed'])->name('inventory.installed');
    Route::patch('/voorraad/onderdelen/{part}', [InventoryController::class, 'updatePart'])->name('inventory.parts.update');

    // Page content editor
    Route::get('/paginas/{slug}', [PageContentController::class, 'edit'])->name('pages.edit');
    Route::put('/paginas/{slug}', [PageContentController::class, 'update'])->name('pages.update');
});
