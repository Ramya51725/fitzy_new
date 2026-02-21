document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
        // Ensure standard video properties for better browser support
        video.setAttribute("playsinline", "true");
        video.muted = true;

        // Load and play if autoplay is desired (standard behavior for these pages)
        // We do NOT overwrite the 'src' anymore to let local assets in HTML work.
        video.load();
        video.play().catch(e => console.warn("Auto-play blocked or source missing:", e));

        const topicLabel = video.parentElement.querySelector(".topic");
        if (topicLabel) {
            console.log(`📡 Using local source for: ${topicLabel.innerText.trim()}`);
            // If the user wants to debug paths, they can see the current source in console
            const currentSrc = video.querySelector("source") ? video.querySelector("source").src : video.src;
            console.log(`   Path: ${currentSrc}`);
        }
    });
});
