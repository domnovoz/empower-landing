// Shader Sources
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform float uRotation;
  uniform vec2 uResolution;
  uniform float uCamDistance;
  
  // Structure & Noise
  uniform float uInternalDensity;
  uniform float uInternalStep;
  uniform float uNoiseIter;
  uniform float uNoiseScale;
  uniform float uStepMin;
  
  // Flare
  uniform float uFlareSize;
  uniform float uFlareIntensity;
  uniform float uFlareCoverage;
  uniform float uFlareSoftness;
  
  // Audio Response
  uniform float uAudioPulse; // Replaces uAudioLevel
  
  // Colors & Post
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uColorPhase;
  uniform float uColorMixRatio;
  uniform float uColorSmoothness;
  uniform float uExposure;
  uniform float uGlobalOpacity;

  varying vec2 vUv;
  
  vec3 getPalette(float x) {
    // Use uTime directly for consistent phase animation
    // uColorPhase now controls the frequency/speed of color cycling
    float phase = cos(3.14159 * x + uTime) * 0.5 + 0.5;
    
    // Using the requested range for Mix Ratio
    float edge0 = clamp(uColorMixRatio - uColorSmoothness * 0.5, -1.0, 2.0);
    float edge1 = clamp(uColorMixRatio + uColorSmoothness * 0.5, -1.0, 2.0);
    float mixFactor = smoothstep(edge0, edge1, phase);
    
    return mix(uColorA, uColorB, mixFactor);
  }
  
  vec2 rotate2D(vec2 v, float a) {
    float c = cos(a); float s = sin(a);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
  }

  void main() {
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    
    // --- FULL ORB PCM SCALING ---
    // Scale the entire rendering space by the audio pulse. 
    // uAudioPulse > 0 shrinks the space, making the orb physically expand.
    uv *= (1.0 - uAudioPulse);
    
    float focal = 2.0;
    
    vec2 roXZ = rotate2D(vec2(0.0, uCamDistance), uRotation);
    vec3 ro = vec3(roXZ.x, 0.0, roXZ.y);
    
    vec3 rdBase = normalize(vec3(uv, -focal));
    vec2 rdXZ = rotate2D(vec2(rdBase.x, rdBase.z), uRotation);
    vec3 rd = vec3(rdXZ.x, rdBase.y, rdXZ.y);
    
    vec3 accumulatedColor = vec3(0.0);
    
    float RADIUS = 2.0;
    float FLARE_RADIUS = RADIUS + uFlareSize; // Reverting flare audio hack
    
    float tCenter = dot(-ro, rd);
    vec3 closestP = ro + rd * tCenter;
    float dSq = dot(closestP, closestP);
    float d = sqrt(dSq);

    if (d < FLARE_RADIUS) {
        float halfChordFlare = sqrt(max(0.0, FLARE_RADIUS * FLARE_RADIUS - dSq));
        float tNear = max(0.0, tCenter - halfChordFlare);
        float tFar = tCenter + halfChordFlare;
        float t = tNear;

        for(int i = 0; i < 80; i++) {
            if(t >= tFar) break;
            
            vec3 p = ro + rd * t;
            float dFromC = length(p);
            
            vec3 pN = p * uNoiseScale;
            float T = (t + uTime * 0.5) / 5.0; 
            pN.xy = rotate2D(pN.xy, T);
            for(float f = 0.0; f < 9.0; f++) {
                if(f >= uNoiseIter) break;
                float a = exp(f) / pow(2.0, f);
                pN += cos(pN.yzx * a + uTime) / a;
            }
            
            float structure = abs(pN.y - 1.0) / 10.0; 
            float densityField = uInternalDensity + structure;
            float stepVal = densityField * uInternalStep;
            
            if (dFromC < RADIUS) {
                float intensity = 0.001 / densityField;
                accumulatedColor += getPalette(t) * intensity;
            } else {
                float flareFade = pow(1.0 - smoothstep(RADIUS, FLARE_RADIUS, dFromC), uFlareSoftness);
                float brightness = 1.0 / (structure + 0.001); 
                float threshold = 50.0 * (1.0 - uFlareCoverage); 
                
                if (brightness > threshold && uFlareCoverage > 0.0) {
                    float intensity = (uFlareIntensity * 0.001) / densityField;
                    accumulatedColor += getPalette(t) * intensity * flareFade;
                }
                stepVal *= 2.0; 
            }
            t += max(uStepMin, stepVal); 
        }
    }
    
    vec3 outColor = 1.0 - exp(-accumulatedColor * uExposure);
    outColor = pow(outColor, vec3(1.0 / 2.2));
    
    float brightness = dot(outColor, vec3(0.299, 0.587, 0.114));
    float finalAlpha = smoothstep(0.0, 0.1, brightness) * uGlobalOpacity;
    
    gl_FragColor = vec4(outColor, finalAlpha);
  }
`;

// Uniforms Configuration (Base / Idle State)
const orbUniforms = {
    uTime: { value: 0 },
    uRotation: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uColorA: { value: new THREE.Color(5 / 255, 30 / 255, 131 / 255) },       // Deep Core Blue
    uColorB: { value: new THREE.Color(255 / 255, 110 / 255, 80 / 255) },     // Orange Sand
    uColorMixRatio: { value: 0.85 },
    uColorSmoothness: { value: 0.8 },
    uColorPhase: { value: 0.8 },
    uExposure: { value: 2.4 },
    uGlobalOpacity: { value: 1.0 },
    uCamDistance: { value: 6.5 },
    uTimeSpeed: { value: 0.08 },       // Smooth baseline pulse
    uRotationSpeed: { value: 0.08 },
    uInternalDensity: { value: 0.03 },
    uInternalStep: { value: 0.25 },
    uNoiseIter: { value: 7.0 },
    uNoiseScale: { value: 1.2 },       // Balanced clouds
    uStepMin: { value: 0.03 },
    uFlareSize: { value: 0.3 },        // Meaningful but controlled idle aura
    uFlareIntensity: { value: 1.3 },
    uFlareCoverage: { value: 0.8 },
    uFlareSoftness: { value: 10.0 },
    uAudioPulse: { value: 0.0 },       // Default pulse scaler
};

const orbUniformsThinking = {
    uTime: { value: 0 },
    uRotation: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uColorA: { value: new THREE.Color(5 / 255, 30 / 255, 131 / 255) },       // Deep Core Blue
    uColorB: { value: new THREE.Color(255 / 255, 110 / 255, 80 / 255) },     // Orange Sand
    uColorMixRatio: { value: 0.85 },   // FIXED: No longer washing out to sand
    uColorSmoothness: { value: 0.8 },
    uColorPhase: { value: 0.8 },
    uExposure: { value: 2.4 },
    uGlobalOpacity: { value: 1.0 },
    uCamDistance: { value: 6.5 },
    uTimeSpeed: { value: 0.12 },       // Energetic but smooth
    uRotationSpeed: { value: 0.12 },
    uInternalDensity: { value: 0.03 },
    uInternalStep: { value: 0.25 },
    uNoiseIter: { value: 7.0 },
    uNoiseScale: { value: 1.0 },       // Slightly wider internal swirling
    uStepMin: { value: 0.03 },
    uFlareSize: { value: 0.75 },       // Noticeable expansion
    uFlareIntensity: { value: 1.4 },
    uFlareCoverage: { value: 0.8 },
    uFlareSoftness: { value: 10.0 },
    uAudioPulse: { value: 0.0 },
};

class ShaderOrb {
    constructor(options) {
        this.container = options.dom;
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.isThinking = false;
        this.isPlaying = true;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        // Deep copy uniforms for this instance
        this.uniforms = JSON.parse(JSON.stringify(orbUniforms));

        // Restore THREE types
        this.uniforms.uResolution.value = new THREE.Vector2(this.container.offsetWidth, this.container.offsetHeight);
        this.uniforms.uColorA.value = new THREE.Color(orbUniforms.uColorA.value.r, orbUniforms.uColorA.value.g, orbUniforms.uColorA.value.b);
        this.uniforms.uColorB.value = new THREE.Color(orbUniforms.uColorB.value.r, orbUniforms.uColorB.value.g, orbUniforms.uColorB.value.b);

        // Store states
        // Idle State explicitly smoothed out
        this.idleValues = this.captureUniformValues(orbUniforms);
        this.idleValues.uTimeSpeed = 0.08;
        this.idleValues.uRotationSpeed = 0.08;

        this.thinkingValues = this.captureUniformValues(orbUniformsThinking);

        // Listening State (Gentle Focus)
        this.listeningValues = this.captureUniformValues(orbUniforms);
        this.listeningValues.uTimeSpeed = 0.12;
        this.listeningValues.uRotationSpeed = 0.12;
        this.listeningValues.uFlareSize = 0.6;
        this.listeningValues.uNoiseScale = 1.1;

        // Speaking State (Middle ground: dynamic, large, but not manic)
        this.speakingValues = this.captureUniformValues(orbUniforms);
        this.speakingValues.uTimeSpeed = 0.25;      // Smooth flowing energy
        this.speakingValues.uRotationSpeed = 0.3;   // Confident turning
        this.speakingValues.uFlareSize = 1.2;       // Large, beautiful aura
        this.speakingValues.uNoiseScale = 0.9;      // Deep, intricate clouds

        this.setupScene();

        this.handleResize = this.handleResize.bind(this);
        this.render = this.render.bind(this);

        requestAnimationFrame(() => {
            this.handleResize();
            this.render();
        });

        window.addEventListener("resize", this.handleResize);
    }

    captureUniformValues(source) {
        const values = {};
        Object.keys(source).forEach((key) => {
            const uniform = source[key];
            if (uniform.value instanceof THREE.Color) {
                values[key] = uniform.value.clone();
            } else {
                values[key] = uniform.value;
            }
        });
        return values;
    }

    setState(stateName) {
        // Legacy support
        if (stateName === true) stateName = 'thinking';
        if (stateName === false) stateName = 'idle';

        if (this.currentState === stateName) return;
        this.currentState = stateName;
        this.transitionToState(stateName);
    }

    setListening(isListening) {
        if (isListening) {
            this.setState('listening');
            this.container.classList.add('listening');
            this.container.classList.remove('speaking', 'thinking');
        } else {
            this.setState('idle');
            this.container.classList.remove('listening');
        }
    }

    setThinking(isThinking) {
        if (isThinking) {
            this.setState('thinking');
            this.container.classList.add('thinking');
            this.container.classList.remove('listening', 'speaking');
        } else {
            this.setState('idle');
            this.container.classList.remove('thinking');
        }
    }

    setSpeaking(isSpeaking) {
        if (isSpeaking) {
            this.setState('speaking'); // We map 'speaking' and 'thinking' similarly in shaders, but differentiate classes
            this.container.classList.add('speaking');
            this.container.classList.remove('listening', 'thinking');
        } else {
            this.setState('idle');
            this.container.classList.remove('speaking');
        }
    }

    transitionToState(stateName) {
        let targetValues;
        if (stateName === 'speaking') {
            targetValues = this.speakingValues;
        } else if (stateName === 'thinking') {
            targetValues = this.thinkingValues;
        } else if (stateName === 'listening') {
            targetValues = this.listeningValues;
        } else {
            targetValues = this.idleValues;
        }
        const duration = 1.25;
        const ease = "power2.inOut";

        const excludedKeys = new Set([
            "uTime",
            "uRotation",
            "uResolution",
            "uTimeSpeed",
            "uRotationSpeed",
        ]);

        Object.keys(targetValues).forEach((key) => {
            if (excludedKeys.has(key)) return;

            const targetValue = targetValues[key];
            const activeUniform = this.uniforms[key];
            if (!activeUniform) return;

            if (targetValue instanceof THREE.Color) {
                gsap.to(activeUniform.value, {
                    r: targetValue.r,
                    g: targetValue.g,
                    b: targetValue.b,
                    duration,
                    ease
                });
            } else if (typeof targetValue === "number") {
                gsap.to(activeUniform, {
                    value: targetValue,
                    duration,
                    ease
                });
            }
        });

        // Animate speed uniforms separately
        const targetTimeSpeed = targetValues["uTimeSpeed"];
        const targetRotationSpeed = targetValues["uRotationSpeed"];

        if (typeof targetTimeSpeed === "number") {
            gsap.to(this.uniforms.uTimeSpeed, {
                value: targetTimeSpeed,
                duration,
                ease,
            });
        }

        if (typeof targetRotationSpeed === "number") {
            gsap.to(this.uniforms.uRotationSpeed, {
                value: targetRotationSpeed,
                duration,
                ease,
            });
        }
    }

    setupScene() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: this.uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    }

    handleResize() {
        if (!this.container) return;
        const width = this.container.offsetWidth || 1;
        const height = this.container.offsetHeight || 1;
        this.renderer.setSize(width, height);
        this.uniforms.uResolution.value.set(width, height);
    }

    render() {
        if (!this.isPlaying) return;

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.uniforms.uTime.value += delta * this.uniforms.uTimeSpeed.value;
        this.uniforms.uRotation.value += delta * this.uniforms.uRotationSpeed.value;

        // PCM simulated pulse
        let targetPulse = 0;

        if (this.currentState === 'speaking') {
            // Calm speaking volume
            const baseThrob = Math.sin(time * 2.5) * 0.4;
            const midWarble = Math.sin(time * 5.0) * 0.2;
            const highJitter = Math.sin(time * 10.0) * 0.05;
            let wave = baseThrob + midWarble + highJitter + 0.65;
            targetPulse = Math.max(0, wave) * 0.06;

        } else if (this.currentState === 'listening') {
            // Gentle breathing focus
            const slowBreathe = Math.sin(time * 3) * 0.5;
            const softTremble = Math.sin(time * 8) * 0.15;
            let wave = slowBreathe + softTremble + 0.65;
            targetPulse = Math.max(0, wave) * 0.04;

        } else if (this.currentState === 'thinking' || this.currentState === 'idle') {
            // "Alive at rest": very subtle continuous breathing so it never freezes
            const deepBreathe = Math.sin(time * 1.5) * 0.5 + 0.5; // 0 to 1 range
            targetPulse = deepBreathe * 0.02; // Very slight 2% swell
        }

        // Smoothly interpolate the actual uniform to the target pulse (softer transition)
        this.uniforms.uAudioPulse.value = THREE.MathUtils.lerp(
            this.uniforms.uAudioPulse.value,
            targetPulse,
            delta * 4.0
        );

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }

    stop() {
        this.isPlaying = false;
        window.removeEventListener("resize", this.handleResize);
        this.renderer.dispose();
    }
}

window.ShaderOrb = ShaderOrb;
