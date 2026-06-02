<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    /**
     * Upload a file to Cloudinary.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string|null The secure HTTPS URL of the uploaded asset, or null on failure.
     */
    public static function upload(UploadedFile $file, string $folder = 'page_portal'): ?string
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            Log::error('Cloudinary credentials are not fully configured in the environment.');
            return null;
        }

        $timestamp = time();
        
        // Signed upload parameters
        $params = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];
        
        // Alphabetical sort of parameters for signature generation
        ksort($params);
        
        $signString = "folder={$folder}&timestamp={$timestamp}" . $apiSecret;
        $signature = sha1($signString);

        try {
            $response = Http::asMultipart()
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post("https://api.cloudinary.com/v1_1/{$cloudName}/upload", [
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'signature' => $signature,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['secure_url'] ?? null;
            }

            Log::error('Cloudinary upload failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Cloudinary upload exception: ' . $e->getMessage());
            return null;
        }
    }
}
