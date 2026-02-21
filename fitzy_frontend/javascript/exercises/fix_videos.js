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
        "Plank": "https://res.cloudinary.com/djek05t0d/image/upload/v1765822837/plank_eb3qki.mp4",
        "Squats": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831068/squats_hzjtvu.mp4",
        "Lunges": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831052/Lunges_j8kzp4.mp4",
        "Jumping squat": "https://res.cloudinary.com/djek05t0d/video/upload/v1765831042/jumping_squat_ponwpb.mp4",
        "Pike pushup": "https://res.cloudinary.com/djek05t0d/video/upload/v1765855275/pick_push_ups_nen0yf.mp4",
        "Inch worm": "https://res.cloudinary.com/djek05t0d/video/upload/v1765817092/Inch_worms_ljtzl9.mp4",
        "Butt bridge": "https://res.cloudinary.com/djek05t0d/video/upload/v1765825792/butt_bridge_qdczyr.mp4",
        "Cat cow pose": "https://res.cloudinary.com/djek05t0d/video/upload/v1765822780/cat_cow_pose_sefkfk.mp4"
    };

    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
        const topicLabel = video.parentElement.querySelector(".topic");
        if (topicLabel) {
            const exerciseName = topicLabel.innerText.trim();
            if (videoMapping[exerciseName]) {
                const source = video.querySelector("source");
                if (source) {
                    console.log(`Fixing video for: ${exerciseName}`);
                    source.src = videoMapping[exerciseName];
                    video.load(); // Reload video with new source
                }
            } else {
                console.warn(`No video mapping found for: ${exerciseName}`);
            }
        }
    });
});
