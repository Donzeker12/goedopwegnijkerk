<?php

use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\HomepageReviewsController;
use App\Http\Controllers\Admin\GoogleImageController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PageContentController;
use App\Http\Controllers\Admin\PushSubscriptionController;
use App\Http\Controllers\Admin\PwaController;
use App\Http\Controllers\Admin\ScooterController;
use App\Http\Controllers\Admin\ScooterPriceResearchController;
use App\Http\Controllers\Admin\ScooterPartController;
use App\Http\Controllers\Admin\ScooterPhotoController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocationLandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShopController;
use App\Models\BlogPost;
use App\Models\Scooter;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/over-ons', [AboutController::class, 'index'])->name('about');
Route::get('/faq', [FaqController::class, 'index'])->name('faq');
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
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
Route::get('/review/{token}', [ReviewController::class, 'create'])->name('reviews.create');
Route::post('/review/{token}', [ReviewController::class, 'store'])->name('reviews.store')->middleware('throttle:10,1');

Route::get('/sitemap.xml', function () {
    $today = Carbon::now()->toDateString();

    $baseUrls = collect([
        ['loc' => url('/'), 'lastmod' => $today],
        ['loc' => url('/scooters'), 'lastmod' => $today],
        ['loc' => url('/over-ons'), 'lastmod' => $today],
        ['loc' => url('/faq'), 'lastmod' => $today],
        ['loc' => url('/blog'), 'lastmod' => $today],
    ]);

    $scooterUrls = Scooter::query()
        ->where('ready_for_sale', true)
        ->where('status', 'te_koop')
        ->get(['id', 'updated_at'])
        ->map(fn (Scooter $scooter) => [
            'loc' => url('/scooters/' . $scooter->id),
            'lastmod' => $scooter->updated_at?->toDateString() ?? $today,
        ]);

    $blogUrls = BlogPost::query()
        ->where('is_published', true)
        ->where('published_at', '!=', null)
        ->get(['slug', 'published_at', 'updated_at'])
        ->map(fn (BlogPost $post) => [
            'loc' => url('/blog/' . $post->slug),
            'lastmod' => $post->updated_at?->toDateString()
                ?? $post->published_at?->toDateString()
                ?? $today,
        ]);

    $cityUrls = collect(array_keys(config('seo.city_pages', [])))
        ->map(fn (string $citySlug) => [
            'loc' => url('/scooter-kopen-in-' . $citySlug),
            'lastmod' => $today,
        ]);

    $xml = view('sitemap', [
        'urls' => $baseUrls
            ->merge($scooterUrls)
            ->merge($blogUrls)
            ->merge($cityUrls)
            ->unique('loc')
            ->values(),
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

    // Favorites routes
    Route::post('/api/favorieten/{scooter}/toggle', [FavoritesController::class, 'toggle'])->name('favorites.toggle');
    Route::get('/api/favorieten/{scooter}/check', [FavoritesController::class, 'isFavorited'])->name('favorites.check');
    Route::get('/api/favorieten/ids', [FavoritesController::class, 'listFavoritedIds'])->name('favorites.ids');
    Route::get('/profiel/favorieten', [FavoritesController::class, 'list'])->name('favorites.list');
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
    Route::get('/scooters/{scooter}/garantieblad', [ScooterController::class, 'editWarranty'])->name('scooters.warranty.edit');
    Route::put('/scooters/{scooter}/garantieblad', [ScooterController::class, 'updateWarranty'])->name('scooters.warranty.update');
    Route::get('/scooters/{scooter}/onderhoudsformulier', [ScooterController::class, 'editMaintenance'])->name('scooters.maintenance.edit');
    Route::put('/scooters/{scooter}/onderhoudsformulier', [ScooterController::class, 'updateMaintenance'])->name('scooters.maintenance.update');
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
    Route::get('/scooters/{scooter}/prijsindicatie', [ScooterPriceResearchController::class, 'estimate'])->name('scooters.price.estimate');

    // Brands & Models
    Route::post('/merken', [BrandController::class, 'store'])->name('brands.store');
    Route::post('/merken/{brand}/modellen', [BrandController::class, 'storeModel'])->name('brands.models.store');

    // Blog
    Route::get('/blog', [AdminBlogController::class, 'index'])->name('blog.index');
    Route::get('/blog/nieuw', [AdminBlogController::class, 'create'])->name('blog.create');
    Route::post('/blog', [AdminBlogController::class, 'store'])->name('blog.store');
    Route::get('/blog/{post}/preview', [AdminBlogController::class, 'preview'])->name('blog.preview');
    Route::get('/blog/{post}/bewerken', [AdminBlogController::class, 'edit'])->name('blog.edit');
    Route::put('/blog/{post}', [AdminBlogController::class, 'update'])->name('blog.update');
    Route::delete('/blog/{post}', [AdminBlogController::class, 'destroy'])->name('blog.destroy');
    Route::post('/blog/editor/afbeelding', [AdminBlogController::class, 'uploadEditorImage'])->name('blog.editor-image.store');
    Route::post('/blog/{post}/fotos', [AdminBlogController::class, 'uploadPhotos'])->name('blog.photos.store');
    Route::patch('/blog/{post}/fotos/{photo}/cover', [AdminBlogController::class, 'setCover'])->name('blog.photos.cover');
    Route::delete('/blog/{post}/fotos/{photo}', [AdminBlogController::class, 'destroyPhoto'])->name('blog.photos.destroy');

    // Reviews
    Route::get('/reviews', [HomepageReviewsController::class, 'index'])->name('reviews.index');
    Route::put('/reviews', [HomepageReviewsController::class, 'update'])->name('reviews.update');
    Route::post('/reviews/links', [HomepageReviewsController::class, 'createInvite'])->name('reviews.links.store');
    Route::patch('/reviews/{review}/status', [HomepageReviewsController::class, 'updateStatus'])->name('reviews.status.update');

    // Chat
    Route::get('/chat', [AdminChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{session}', [AdminChatController::class, 'show'])->name('chat.show');
    Route::delete('/chat/{session}', [AdminChatController::class, 'destroy'])->name('chat.destroy');
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
    Route::get('/voorraad/producten/nieuw', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('/voorraad/producten', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/voorraad/geplaatst', [InventoryController::class, 'installed'])->name('inventory.installed');
    Route::patch('/voorraad/onderdelen/{part}', [InventoryController::class, 'updatePart'])->name('inventory.parts.update');
    Route::delete('/voorraad/onderdelen/{part}', [InventoryController::class, 'destroyPart'])->name('inventory.parts.destroy');

    // Page content editor
    Route::get('/paginas/{slug}', [PageContentController::class, 'edit'])->name('pages.edit');
    Route::put('/paginas/{slug}', [PageContentController::class, 'update'])->name('pages.update');

    // Site settings
    Route::get('/site-instellingen', [SiteSettingsController::class, 'index'])->name('site-settings.index');
    Route::get('/site-instellingen/{section}', [SiteSettingsController::class, 'edit'])->name('site-settings.edit');
    Route::put('/site-instellingen/{section}', [SiteSettingsController::class, 'update'])->name('site-settings.update');
});
