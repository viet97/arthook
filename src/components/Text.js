import React, { PureComponent } from 'react';
import { Text as RNText } from 'react-native';

export const FONT_FAMILY = {
    extraBold: 'Poppins-ExtraBold',
    bold: 'Poppins-Bold',
    semiBold: 'Poppins-SemiBold',
    regular: 'Poppins-Regular',
}

class Text extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const {
            bold,
            semiBold,
            extraBold,
            style,
            ...otherProps
        } = this.props;
        let fontFamily = FONT_FAMILY.regular;
        if (bold) {
            fontFamily = FONT_FAMILY.bold
        }
        if (semiBold) {
            fontFamily = FONT_FAMILY.semiBold
        }
        if (extraBold) {
            fontFamily = FONT_FAMILY.extraBold
        }
        return (
            <RNText
                {...otherProps}
                style={[style, { fontFamily }]}
            />
        );
    }
}

export default Text;
