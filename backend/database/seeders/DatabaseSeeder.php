<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\PostAttachment;
use App\Models\ArticleSubmission;
use App\Models\Message;
use App\Models\UserActivity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Clear existing database data (cascades handle children)
        User::query()->delete();
        Post::query()->delete();
        ArticleSubmission::query()->delete();
        Message::query()->delete();
        UserActivity::query()->delete();

        // 2. Create standard users
        $admin = User::create([
            'name' => 'PAGE Admin Directory',
            'email' => 'admin@page.edu',
            'password' => Hash::make('AdminSecret123!'),
            'role' => 'admin',
            'university' => 'Philippine Association for Graduate Education (PAGE)',
            'position' => 'Executive Director',
            'status' => 'active',
        ]);

        $org = User::create([
            'name' => 'Gordon College Graduate Council',
            'email' => 'gordon@page.edu',
            'password' => Hash::make('OrgSecret123!'),
            'role' => 'organization',
            'university' => 'Gordon College',
            'position' => 'Council Chair',
            'status' => 'active',
        ]);

        $member = User::create([
            'name' => 'Dr. Maria Santos',
            'email' => 'member@page.edu',
            'password' => Hash::make('MemberSecret123!'),
            'role' => 'member',
            'university' => 'University of Santo Tomas',
            'position' => 'Professor of Graduate Studies',
            'status' => 'active',
        ]);

        // 3. Preseed Sample Posts
        $publishedPost = Post::create([
            'user_id' => $admin->id,
            'title' => 'PAGE National Convention 2026: Graduate Research Excellence',
            'category' => 'announcement',
            'author' => 'PAGE Admin Directory',
            'excerpt' => 'Join the upcoming PAGE National Convention this year. Gathering leading educators and researchers from across the Philippines.',
            'content_html' => '<p>We are pleased to announce the <strong>PAGE National Convention 2026</strong>. This event focuses on sharing cutting edge pedagogical methodologies and breakthrough research in graduate studies across local universities.</p>',
            'status' => 'published',
            'published_at' => now()->subDays(5),
        ]);

        // Bind attachment to convention post
        PostAttachment::create([
            'post_id' => $publishedPost->id,
            'file_path' => 'https://res.cloudinary.com/dsvxqj0wj/image/upload/v1700000000/sample_convention.jpg',
            'file_type' => 'featured_image',
            'file_name' => 'sample_convention.jpg',
        ]);

        $pendingPost = Post::create([
            'user_id' => $org->id,
            'title' => 'Innovative Digital Classrooms in Graduate Engineering Studies',
            'category' => 'article',
            'author' => 'Gordon College Graduate Council',
            'excerpt' => 'A comprehensive review of digital workspace adoption inside post-graduate engineering courses.',
            'content_html' => '<p>Integrating cloud computing platforms and collaborative visual canvases inside mechanical engineering and systems architectures has seen a 40% user adoption growth...</p>',
            'status' => 'pending',
        ]);

        // 4. Preseed Article Submissions
        ArticleSubmission::create([
            'user_id' => $org->id,
            'title' => 'Optimizing Hybrid Educational Ecosystems in Philippine Graduate Schools',
            'author' => 'Dr. Alexander Gomez',
            'abstract' => 'This paper explores the efficacy of blended educational ecosystems within graduate programs. Through a comprehensive mixed-method analysis involving 15 member institutions, we study student retention, satisfaction index, and academic results.',
            'keywords' => ['hybrid learning', 'graduate school', 'philippines', 'retention index'],
            'file_path' => 'https://res.cloudinary.com/dsvxqj0wj/raw/upload/v1700000001/sample_research_doc.pdf',
            'file_name' => 'hybrid_education_efficacy_UST.pdf',
            'status' => 'pending',
        ]);

        // 5. Preseed Chat Thread Conversations
        $convId = 'conv_admin_gordon_' . time();
        
        Message::create([
            'conversation_id' => $convId,
            'sender_id' => $org->id,
            'receiver_id' => $admin->id,
            'subject' => 'Payment Verification Issue',
            'text' => 'Greetings Admin! We have submitted our post for approval, but we are unsure if our proof of payment receipt has been uploaded successfully. Could you please double check?',
            'status' => 'sent',
            'created_at' => now()->subHours(4),
        ]);

        Message::create([
            'conversation_id' => $convId,
            'sender_id' => $admin->id,
            'receiver_id' => $org->id,
            'subject' => 'Payment Verification Issue',
            'text' => 'Hello Gordon College. Yes, we can confirm the proof of payment receipt has been received and verified. Your post status is currently in the review queue and will be published shortly.',
            'status' => 'sent',
            'created_at' => now()->subHours(2),
        ]);

        // 6. Preseed User Log entries
        UserActivity::create([
            'user_id' => $admin->id,
            'action' => 'PAGE Administration Portal database initialized and seeded.',
            'ip_address' => '127.0.0.1',
        ]);

        UserActivity::create([
            'user_id' => $org->id,
            'action' => 'Submitted draft article: Innovative Digital Classrooms.',
            'ip_address' => '192.168.1.45',
        ]);
    }
}
