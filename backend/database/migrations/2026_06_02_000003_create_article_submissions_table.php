<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('article_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // organization submitting it
            $table->string('title');
            $table->string('author');
            $table->text('abstract');
            $table->json('keywords'); // JSON array of keywords
            $table->string('file_path'); // Cloudinary URL of PDF/DOCX
            $table->string('file_name');
            $table->string('status')->default('pending'); // pending, in-review, revision, approved, rejected
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->onDelete('set null'); // assigned reviewer (optional)
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_submissions');
    }
};
