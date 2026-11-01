import React, { Component, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { isDebugDisabled } from '../../utils/debugSwitches';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class PostProcessingErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[PostProcessingRig] Bypassing post-processing due to WebGL buffer reset:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const PostProcessingContent: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const reduceEffects = useJourneyStore((s) => s.reduceEffects);
  const gl = useThree((s) => s.gl);

  // Hard rule: low tier, reduceEffects, or ?post=off has ZERO post-processing overhead
  if (tier === 'low' || reduceEffects || isDebugDisabled('post')) {
    return null;
  }

  // Guard against WebGL context loss or null context attributes
  const ctx = gl.getContext?.();
  if (!ctx || ctx.isContextLost?.() || !gl.getContextAttributes()) {
    return null;
  }

  // Mid tier: bloom only (half resolution) as specified by Performance Pass
  if (tier === 'mid') {
    return (
      <EffectComposer multisampling={0} autoClear={false}>
        <Bloom
          luminanceThreshold={0.92}
          luminanceSmoothing={0.25}
          intensity={0.2}
          mipmapBlur
          resolutionScale={0.5}
        />
      </EffectComposer>
    );
  }

  // High tier: subtle controlled Bloom + rich cinema Vignette (no washed out glare)
  return (
    <EffectComposer multisampling={0} autoClear={false}>
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.2}
        intensity={0.25}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
    </EffectComposer>
  );
};

export const PostProcessingRig: React.FC = () => {
  return (
    <PostProcessingErrorBoundary>
      <PostProcessingContent />
    </PostProcessingErrorBoundary>
  );
};
