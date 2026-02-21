document.addEventListener("DOMContentLoaded", () => {
    const videoMapping = {
        "Chest press pulse": "https://res.cloudinary.com/djek05t0d/video/upload/v1765850494/Chest_press_pulse_dwafvy.mp4",
        "Knee pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816989/Knee_push_ups_cpucv7.mp4",
        "Knee push ups": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816989/Knee_push_ups_cpucv7.mp4",
        "Pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816998/push_ups_yyvqte.mp4",
        "Push up": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816998/push_ups_yyvqte.mp4",
        "Wide arm pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816998/wide_arms_pushups_i6gnu8.mp4",
        "Inclined pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816990/inclined_push_ups_ad1701.mp4",
        "Incline pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816990/inclined_push_ups_ad1701.mp4",
        "Elbow back": "https://res.cloudinary.com/djek05t0d/video/upload/v1765872740/Elbow_back_bd2d2i.mp4",
        "Tricep kickbacks": "https://res.cloudinary.com/djek05t0d/video/upload/v1765825794/triceps_kickbacks_hzztau.mp4",
        "Tricep kickback": "https://res.cloudinary.com/djek05t0d/video/upload/v1765825794/triceps_kickbacks_hzztau.mp4",
        "Staggered pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765825792/stagered_pushups_apmu97.mp4",
        "Side arm raises": "https://res.cloudinary.com/djek05t0d/video/upload/v1765822792/side_arm_raises_uirtpc.mp4",
        "Arm circle": "https://res.cloudinary.com/djek05t0d/video/upload/v1765828523/arm_circle_nuslnh.mp4",
        "Arm raises": "https://res.cloudinary.com/djek05t0d/video/upload/v1765822779/arm_raises_wgjhsl.mp4",
        "Armscissor": "https://res.cloudinary.com/djek05t0d/video/upload/v1765817104/scissors_su7ipf.mp4",
        "Arm scissor": "https://res.cloudinary.com/djek05t0d/video/upload/v1765817104/scissors_su7ipf.mp4",
        "Jumping jacks": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816989/jumping_jack_zmarn3.mp4",
        "Cobra Stretch": "https://res.cloudinary.com/djek05t0d/image/upload/v1765816987/cobra_stretch_qvnpxf.mp4",
        "Leg raises": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816907/leg_raises_wv2hob.mp4",
        "Russian twist": "https://res.cloudinary.com/djek05t0d/video/upload/v1765816908/russian_twist_xjnxcm.mp4",
        "Mountain climber": "https://res.cloudinary.com/djek05t0d/video/upload/v1765817098/mountain_climb_ejhccv.mp4",
        "Mountain climb": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855275/mountain_climb_tealkb.mp4",
        "Plank": "https://res.cloudinary.com/djek05t0d/image/upload/v1765822837/plank_eb3qki.mp4",
        "Squats": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831068/squats_hzjtvu.mp4",
        "Lunges": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831052/Lunges_j8kzp4.mp4",
        "Jumping squat": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831042/jumping_squat_ponwpb.mp4",
        "Pike pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855275/pick_push_ups_nen0yf.mp4",
        "Inch worm": "https://res.cloudinary.com/djek05t0d/video/upload/v1765817092/Inch_worms_ljtzl9.mp4",
        "Butt bridge": "https://res.cloudinary.com/djek05t0d/video/upload/v1765825792/butt_bridge_qdczyr.mp4",
        "Cat cow pose": "https://res.cloudinary.com/djek05t0d/video/upload/v1765822780/cat_cow_pose_sefkfk.mp4",
        "Burpees": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855334/burpees_h27nqm.mp4",
        "Abdominal crunches": "https://res.cloudinary.com/djek05t0d/video/upload/v1765850493/abdominal_crunches_mt5roy.mp4",
        "Dumbbell punch": "https://res.cloudinary.com/djek05t0d/video/upload/v1765872740/dumbell_punch_gylkid.mp4",
        "High stepping": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855325/High_stepping_r9hiqs.mp4",
        "Cursty lunges": "https://res.cloudinary.com/djek05t0d/video/upload/v1765850433/cursty_lunges_seun6w.mp4",
        "Curtsy lunges": "https://res.cloudinary.com/djek05t0d/video/upload/v1765850433/cursty_lunges_seun6w.mp4",
        "Rhomboid pulls": "https://res.cloudinary.com/djek05t0d/video/upload/v1765872739/rhomboid_pulls_scsc8s.mp4",
        "Reclained rhomboid": "https://res.cloudinary.com/djek05t0d/video/upload/v1765872740/reclained_rhomboid_ckjzn9.mp4",
        "Learning stretches": "https://res.cloudinary.com/djek05t0d/video/upload/v1765872730/learning_stretcher_r8m1er.mp4",
        "In out": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855320/In_outs_on1vvi.mp4",
        "In outs": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855320/In_outs_on1vvi.mp4"
    };

    const normalizedMapping = {};
    for (const key in videoMapping) {
        normalizedMapping[key.toLowerCase()] = videoMapping[key];
    }

    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
        // Ensure standard video properties
        video.setAttribute("playsinline", "true");
        video.muted = true;

        const topicLabel = video.parentElement.querySelector(".topic");
        if (topicLabel) {
            const exerciseName = topicLabel.innerText.trim().toLowerCase();
            if (normalizedMapping[exerciseName]) {
                const videoUrl = normalizedMapping[exerciseName];
                console.log(`✅ Fixing video for: ${exerciseName}`);

                // Update source if exists, otherwise set video src directly
                const source = video.querySelector("source");
                if (source) {
                    source.src = videoUrl;
                }
                video.src = videoUrl; // Fallback/Overwrite for robustness

                video.load();
                video.play().catch(e => console.warn("Auto-play blocked:", e));
            } else {
                console.warn(`🛑 No video mapping found for: "${exerciseName}"`);
            }
        }
    });
});
