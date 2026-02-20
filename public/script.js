// ----------------------------------------------------
// Core Initialization & Live Session Logic
// ----------------------------------------------------

let shaderOrb = null;

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Shader Orb
    const orbContainerElement = document.getElementById('orbContainer');
    if (orbContainerElement && typeof ShaderOrb !== 'undefined') {
        shaderOrb = new ShaderOrb({ dom: orbContainerElement });
        console.log("Shader Orb initialized");
    }

    // Start Demo Flow automatically
    // setTimeout(startAmbientSession, 800);

    const coachBtn = document.getElementById('coachBtn');
    const roleplayBtn = document.getElementById('roleplayBtn');
    const startScreen = document.getElementById('startScreen');
    const activeSessionOverlay = document.getElementById('activeSessionOverlay');
    const orbContainer = document.getElementById('orbContainer');

    // Hide these initially to keep start screen clean
    activeSessionOverlay.style.opacity = '0';
    orbContainer.style.opacity = '0';

    if (coachBtn) {
        coachBtn.addEventListener('click', () => {
            // Fade out start screen
            gsap.to(startScreen, {
                opacity: 0, duration: 0.5, onComplete: () => {
                    startScreen.style.display = 'none';
                    // Fade in orb and overlay
                    gsap.to([orbContainer, activeSessionOverlay], { opacity: 1, duration: 0.5 });
                    startAmbientSession();
                }
            });
        });
    }

    if (roleplayBtn) {
        roleplayBtn.addEventListener('click', () => {
            // Fade out start screen
            gsap.to(startScreen, {
                opacity: 0, duration: 0.5, onComplete: () => {
                    startScreen.style.display = 'none';
                    startRoleplayFlow();
                }
            });
        });
    }

    // Close button for Insights screen loops back to start screen
    const closeInsightsBtn = document.getElementById('closeInsightsBtn');
    if (closeInsightsBtn) {
        closeInsightsBtn.addEventListener('click', () => {
            const evaluationInsightsScreen = document.getElementById('evaluationInsightsScreen');
            gsap.to(evaluationInsightsScreen, {
                opacity: 0, duration: 0.4, onComplete: () => {
                    evaluationInsightsScreen.style.display = 'none';
                    startScreen.style.display = 'flex';
                    gsap.to(startScreen, { opacity: 1, duration: 0.4 });
                }
            });
        });
    }

    // Exit Roleplay Video button
    const exitRoleplayVideoBtn = document.getElementById('exitRoleplayVideoBtn');
    if (exitRoleplayVideoBtn) {
        exitRoleplayVideoBtn.addEventListener('click', () => {
            const roleplayVideoScreen = document.getElementById('roleplayVideoScreen');
            const orbContainer = document.getElementById('orbContainer');
            const engageVideo = document.getElementById('engageVideo');

            gsap.to([roleplayVideoScreen], {
                opacity: 0, duration: 0.5, onComplete: () => {
                    roleplayVideoScreen.style.display = 'none';
                    if (engageVideo) engageVideo.pause();
                    orbContainer.classList.remove('blurred-bg');
                    gsap.to(orbContainer, { opacity: 0, duration: 0.5 });
                    startScreen.style.display = 'flex';
                    gsap.to(startScreen, { opacity: 1, duration: 0.5 });
                }
            });
        });
    }
});

// ----------------------------------------------------
// New Roleplay Engaged Sequence
// ----------------------------------------------------
function startRoleplayFlow() {
    const roleplayVideoScreen = document.getElementById('roleplayVideoScreen');
    const engageVideo = document.getElementById('engageVideo');
    const roleplayResultsPopup = document.getElementById('roleplayResultsPopup');
    const seeResultsBtn = document.getElementById('seeResultsBtn');
    const evaluationInsightsScreen = document.getElementById('evaluationInsightsScreen');
    const orbContainer = document.getElementById('orbContainer');

    // 1. Prepare elements
    roleplayVideoScreen.style.display = 'flex';
    orbContainer.classList.add('blurred-bg');

    // Set initial states
    gsap.set([roleplayVideoScreen, orbContainer], { opacity: 0 });

    if (engageVideo) {
        engageVideo.currentTime = 0;
        engageVideo.play();
    }

    // 2. Reveal Sequence: Avatar first
    gsap.to(roleplayVideoScreen, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
    });

    // 3. Reveal Sequence: Orb drifts in shortly after
    gsap.to(orbContainer, {
        opacity: 1,
        duration: 1.5,
        delay: 0.3,
        ease: "power2.inOut"
    });

    // Wait 5s simulated session time, then slide up popup
    setTimeout(() => {
        // If user already exited, don't show popup
        if (roleplayVideoScreen.style.display === 'none') return;

        const roleplayEndStatus = document.getElementById('roleplayEndStatus');
        if (roleplayEndStatus) {
            roleplayEndStatus.style.display = 'block';
            gsap.to(roleplayEndStatus, {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        // Wait 3.5 seconds showing the text, then fade it out and show the drawer
        setTimeout(() => {
            if (roleplayVideoScreen.style.display === 'none') return;

            if (roleplayEndStatus) {
                gsap.to(roleplayEndStatus, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.in",
                    onComplete: () => {
                        roleplayEndStatus.style.display = 'none';
                    }
                });
            }

            roleplayResultsPopup.style.display = 'flex';
            gsap.fromTo(roleplayResultsPopup,
                { y: '100%', opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power4.out"
                }
            );

            // After 3s of popup being visible, simulate click on CTA
            setTimeout(() => {
                if (roleplayResultsPopup.style.display === 'none') return;

                seeResultsBtn.classList.add('clicked-state');

                setTimeout(() => {
                    seeResultsBtn.classList.remove('clicked-state');

                    // Coherent exit transition: sink everything down and fade out
                    gsap.to([roleplayResultsPopup, roleplayVideoScreen, orbContainer], {
                        opacity: 0,
                        y: 40,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "power2.inOut",
                        onComplete: () => {
                            roleplayResultsPopup.style.display = 'none';
                            roleplayVideoScreen.style.display = 'none';
                            gsap.set([roleplayResultsPopup, roleplayVideoScreen], { y: 0 }); // reset for next time
                            if (engageVideo) engageVideo.pause();

                            // Fade in Insights Screen
                            evaluationInsightsScreen.style.display = 'flex';
                            gsap.fromTo(evaluationInsightsScreen,
                                { opacity: 0, scale: 0.98 },
                                {
                                    opacity: 1,
                                    scale: 1,
                                    duration: 1.0,
                                    ease: "power3.out"
                                }
                            );
                        }
                    });
                }, 300); // simulated click duration
            }, 3000);
        }, 3500); // end of 3.5s timeout for text
    }, 5000);
}

function typeSmoothLine(container, text, role, onComplete) {
    const line = document.createElement('div');
    line.className = `ambient-line ${role} active`;

    // Split into words first to prevent characters wrapping mid-word
    const words = text.split(' ');

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap'; // Keeps the whole word together

        const chars = word.split('');
        chars.forEach((char) => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.opacity = '0';
            charSpan.style.transform = 'translateY(10px)';
            charSpan.style.filter = 'blur(4px)';
            charSpan.style.display = 'inline-block';
            wordSpan.appendChild(charSpan);
        });

        line.appendChild(wordSpan);

        // Add realistic spacing between words
        if (wordIndex < words.length - 1) {
            line.appendChild(document.createTextNode(' '));
        }
    });

    container.appendChild(line);

    // Fade the whole line block in immediately
    gsap.to(line, { opacity: 1, duration: 0.1 });

    // Stagger characters buttery smooth
    const charElements = line.querySelectorAll('span > span');
    gsap.to(charElements, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.02, // Fast, crisp typing feel
        ease: 'power3.out',
        onComplete: () => {
            if (onComplete) setTimeout(onComplete, 800); // Natural pause at end of line
        }
    });
}

function startAmbientSession() {
    const transcriptContainer = document.getElementById('ambientTranscript');
    if (!transcriptContainer) return;

    transcriptContainer.innerHTML = '';
    transcriptContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    transcriptContainer.style.opacity = '1';

    // Highlighted fix: The 2-turn script ending with a practice prompt
    const script = [
        { role: 'user', text: "Hey, can we practice that pitch?", delayBefore: 1500 },
        { role: 'agent', text: "Absolutely. I think you should try a role play to practice this feeling live—here's a scenario setup.", delayBefore: 800 }
    ];

    let currentStep = 0;

    // Agent starts Listening
    if (shaderOrb && typeof shaderOrb.setListening === 'function') {
        shaderOrb.setListening(true);
    }

    function triggerRoleplayDrawer() {
        const popup = document.getElementById('roleplayPopup');
        if (popup) {
            // Smoothly push transcript up and dim it slightly
            gsap.to(transcriptContainer, {
                y: -100, // Move it up to make room
                opacity: 0.2, // Fade it back
                duration: 1.0,
                ease: "power3.inOut"
            });

            // Rollout the beautiful glass tray
            gsap.to(popup, {
                y: 0,
                opacity: 1,
                duration: 1.0,
                ease: "power4.out",
                delay: 0.2 // slight pause after audio finishes typing
            });

            // Set orb to a slow idle focus behind the glass
            if (shaderOrb) shaderOrb.setState('idle');

            // Auto-transition to fullscreen after 4 seconds
            setTimeout(transitionToFullscreenRoleplay, 4000);
        }
    }

    // ----------------------------------------------------
    // Fullscreen Roleplay Transition Sequence
    // ----------------------------------------------------
    function transitionToFullscreenRoleplay() {
        const popup = document.getElementById('roleplayPopup');
        const fullscreen = document.getElementById('roleplayFullscreen');
        const orbContainer = document.getElementById('orbContainer');
        const popupAvatar = document.getElementById('popupAvatar');
        const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
        const ambientTranscript = document.getElementById('ambientTranscript');

        const popupContentElements = popup.querySelectorAll('.popup-content, .popup-cta, .popup-handle');

        if (!popup || !fullscreen || !orbContainer || !popupAvatar || !fullscreenVideoContainer) return;

        // 1. "Fold" Animation: gracefully drop and fade out the popup contents and transcript
        gsap.to([...popupContentElements, ambientTranscript], {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in"
        });

        // 2. Wait for the fold to finish, then transform the avatar and background
        setTimeout(() => {
            // Push the orb into a cinematic blurred background state
            orbContainer.classList.add('blurred-bg');

            // Seamlessly transfer the static video element to the fullscreen container
            const videoEl = popupAvatar.querySelector('video');
            if (videoEl) {
                fullscreenVideoContainer.appendChild(videoEl);
                videoEl.style.width = '100%';
                videoEl.style.height = '100%';
                videoEl.style.objectFit = 'cover';

                // Keep the video element itself at opacity 1, but softly fade in its container mask
                fullscreenVideoContainer.style.opacity = '0';
                gsap.to(fullscreenVideoContainer, {
                    opacity: 1,
                    duration: 1.0,
                    ease: "power2.inOut"
                });

                // Bring the avatar to life now that it's taking over the screen
                videoEl.play();
            }

            // Hide the old popup background so it doesn't block interactions
            popup.style.display = 'none';

            // Fade in the new interactive fullscreen roleplay UI
            fullscreen.style.pointerEvents = 'auto';
            gsap.fromTo(fullscreen,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    delay: 0.2
                }
            );

        }, 600);
    }

    // Ensure exit transition from coach flow also sinks down
    const exitRoleplayBtn = document.getElementById('exitRoleplayBtn');
    if (exitRoleplayBtn) {
        exitRoleplayBtn.addEventListener('click', () => {
            const fullscreen = document.getElementById('roleplayFullscreen');
            const orbContainer = document.getElementById('orbContainer');
            const videoEl = fullscreen.querySelector('video');

            gsap.to([fullscreen, orbContainer], {
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                    fullscreen.style.pointerEvents = 'none';
                    if (videoEl) videoEl.pause();
                    orbContainer.classList.remove('blurred-bg');
                    gsap.set([fullscreen, orbContainer], { y: 0 });
                    startScreen.style.display = 'flex';
                    gsap.to(startScreen, { opacity: 1, duration: 0.5 });
                }
            });
        });
    }

    function runNextStep() {
        if (currentStep >= script.length) {
            // End of script: trigger the CTA popup
            triggerRoleplayDrawer();
            return;
        }

        const step = script[currentStep];

        // If it's the agent's turn next, trigger the "thinking" state during the pause
        if (step.role === 'agent' && shaderOrb && typeof shaderOrb.setThinking === 'function') {
            shaderOrb.setThinking(true);
        }

        setTimeout(() => {
            // Switch orb state right before typing starts
            if (shaderOrb) {
                if (step.role === 'agent' && typeof shaderOrb.setSpeaking === 'function') {
                    shaderOrb.setSpeaking(true);
                } else if (step.role === 'user' && typeof shaderOrb.setListening === 'function') {
                    shaderOrb.setListening(true);
                }
            }

            // Mark existing lines as historical.
            const existingLines = transcriptContainer.querySelectorAll('.ambient-line');
            existingLines.forEach(l => {
                l.classList.remove('active');
                l.classList.add('historical');
            });

            const appendNewMessage = () => {
                typeSmoothLine(transcriptContainer, step.text, step.role, () => {
                    requestAnimationFrame(() => {
                        const overlay = document.querySelector('.ambient-conversation-overlay');
                        if (overlay) {
                            overlay.scrollTo({
                                top: overlay.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    });

                    currentStep++;
                    runNextStep();
                });
            };

            // Manage DOM: Keep more history so it flows upward (e.g. 10 instead of 2)
            if (transcriptContainer.children.length >= 10) {
                const oldestMessage = transcriptContainer.firstChild;
                gsap.to(oldestMessage, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        oldestMessage.remove();
                        appendNewMessage();
                    }
                });
            } else {
                appendNewMessage();
            }

        }, step.delayBefore);
    }

    // Kick it off
    runNextStep();

    console.log("Ambient Session 5-Turn Script Started");
}
