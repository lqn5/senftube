<script>
    import { goto } from '$app/navigation';
    import Button from '$lib/components/ui/button/button.svelte';
    import Input from '$lib/components/ui/input/input.svelte';
    import Progress from '$lib/components/ui/progress/progress.svelte';
    import Spinner from '$lib/components/ui/spinner/spinner.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { toast } from 'svelte-sonner';
    import * as tus from 'tus-js-client';

    let file = $state();
    let thumbnail = $state();
    let upload = $state();
    let progress = $state(0);
    let title = $state('');
    let description = $state('');
    let imageUploadUrl = $state('');
    let uploading = $state(false);

    let thumbnailPreviewURL = $derived.by(() => {
        if(!thumbnail){
            return;
        }
        return URL.createObjectURL(thumbnail);
    })

    let videoPreviewURL = $derived.by(() => {
        if(!file){
            return;
        }
        return URL.createObjectURL(file);
    })

    let uploadButtonDisabled = $derived(uploading || !file || !thumbnail || title == "" || description == "");

    async function uploadThumbnail() {
        if (!thumbnail || !imageUploadUrl) {
            return;
        }

        const formData = new FormData();
        formData.append('file', thumbnail);

        const response = await fetch(imageUploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Thumbnail-Upload fehlgeschlagen');
        }
    }

    async function startUpload() {
        if (!file || description.length == 0 || description.length > 250 || title.length == 0 || title.length > 50) return toast.error("Titel/Beschreibung zu lang oder keine Videodatei");
        if (!file.type.startsWith('video/')) {
            toast.error('Bitte eine Videodatei auswählen');
            return;
        }

        if (thumbnail && !thumbnail.type.startsWith('image/')) {
            toast.error('Bitte eine Bilddatei für das Thumbnail auswählen');
            return;
        }

        uploading = true;

        const response = await fetch('/api/video/post', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        });

        if (!response.ok) {
            uploading = false;
            toast.error('Video konnte nicht angelegt werden');
            return;
        }

        const result = await response.json();

        toast.success(result.message);

        upload = new tus.Upload(file, {
            endpoint: '/api/video/get-endpoint',
            chunkSize: 50 * 1024 * 1024,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            metadata: {
                name: file.name,
                filetype: file.type
            },
            onBeforeRequest: (req) => {
                if (
                    req.getMethod() === 'POST' &&
                    req.getURL().includes('/api/video/get-endpoint')
                ) {
                    req.setHeader('Upload-Token', result.uploadToken);
                }
            },
            onAfterResponse: (req, res) => {
                if (
                    req.getMethod() === 'POST' &&
                    req.getURL().includes('/api/video/get-endpoint')
                ) {
                    imageUploadUrl = res.getHeader('x-image-upload-url') ?? '';
                }
            },
            onError: (error) => {
                toast.error('Upload fehlgeschlagen');
                console.error(error);
                uploading = false;
                progress = 0;
            },
            onProgress: (bytesSent, bytesTotal) => {
                progress = Math.round((bytesSent / bytesTotal) * 100);
            },
            onSuccess: async () => {
                await uploadThumbnail();
                toast.success('Dein Video wird jetzt verarbeitet!');
                uploading = false;
                progress = 0;
                window.location.href = "/";
            }
        });

        upload.start();
    }
</script>
<div class="pt-24 px-4">
    <div class="w-full md:w-1/3 m-auto border rounded-xl p-4 bg-muted/20 overflow-hidden">
        <Input placeholder="Titel" bind:value={title}></Input>
        <Textarea class="mt-4 mb-4" placeholder="Beschreibung" bind:value={description}></Textarea>
        <div>
            <h3>Video</h3>
            <input accept="video/*" type="file" onchange={(e) => file = e.target.files[0]} />
            {#if videoPreviewURL}
                <video controls class="m-auto mt-2 rounded-xl w-full" src={videoPreviewURL}></video>
            {/if}
        </div>
        <div class="mt-2">
            <h3>Thumbnail</h3>
            <input accept="image/*" type="file" onchange={(e) => thumbnail = e.target.files[0]} />
            <img class="m-auto mt-2 rounded-xl w-full" src={thumbnailPreviewURL} alt="">
        </div>
        <Button disabled={uploadButtonDisabled} class="w-full mt-4" onclick={startUpload}>
            {#if uploading}
                <Spinner></Spinner>
            {/if}
            Upload starten
        </Button>

        {#if progress > 0}
            <Progress class="mt-4" max={100} value={progress}></Progress>
        {/if}
    </div>
</div>
