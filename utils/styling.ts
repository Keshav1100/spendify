import { Dimensions, PixelRatio } from 'react-native';

const { width:SCREEN_WIDTH, height:SCREEN_HEIGHT } = Dimensions.get('window');
const [shortDimension, longDimension] = SCREEN_WIDTH < SCREEN_HEIGHT ? [SCREEN_WIDTH, SCREEN_HEIGHT] : [SCREEN_HEIGHT, SCREEN_WIDTH];

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size:number) => (Math.round(PixelRatio.roundToNearestPixel(shortDimension / guidelineBaseWidth * (size as number))));
export const verticalScale = (size:number) => (Math.round(PixelRatio.roundToNearestPixel(longDimension / guidelineBaseHeight * (size as number))));
// export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
// export const moderateVerticalScale = (size, factor = 0.5) => size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
// export const ms = moderateScale;
// export const mvs = moderateVerticalScale;