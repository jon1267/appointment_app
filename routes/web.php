<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssistantController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('assistant', [AssistantController::class, 'index'])->name('assistant');
    Route::post('assistant/message', [AssistantController::class, 'message'])->name('assistant.message');
});

require __DIR__.'/settings.php';
