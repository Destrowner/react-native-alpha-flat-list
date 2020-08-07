import React, { useState, useRef } from 'react'
import { View, Text, PanResponder } from 'react-native'

import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'

import ResponsiveFontSize from 'react-native-responsive-fontsize'

import styles from './Sidebar.styles'

let containerTop
let containerHeight

function AlphabeticScrollBar (props) {
    const alphabetContainerRef = useRef()

    const [activeLetter, setActiveLetter] = useState(undefined)
    const [activeLetterViewTop, setActiveLetterViewTop] = useState(0)

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderTerminationRequest: () => true, 
            onShouldBlockNativeResponder: () => true,
            onPanResponderGrant: debounce(onPanResponderGrant),
            onPanResponderMove: debounce(onPanResponderMove),
            onPanResponderTerminate: onPanResponderTerminate,
            onPanResponderRelease: onPanResponderTerminate,
        })
    ).current

    function getTouchedLetter (y) {
        const top = y - (containerTop || 0)

        if (top >= 1 && top <= containerHeight) {
            setActiveLetterViewTop(top)

            const lettersRanges = props.letters.map((letter, index) => {
                return {
                    letter: letter,
                    start: index * containerHeight / props.letters.length,
                    end: (index + 1) * containerHeight / props.letters.length
                }
            })

            const index = lettersRanges.findIndex((letter) => letter.start <= top && top <= letter.end)

            return props.letters[index]
        }
    }

    function onPanResponderGrant (event, gestureState) {
        const letter = getTouchedLetter(gestureState.y0)

        onTouchLetter(letter)
    }

    function onPanResponderMove (event, gestureState) {
        const letter = getTouchedLetter(gestureState.moveY)

        onTouchLetter(letter)
    }

    function onTouchLetter (letter) {
        setActiveLetter(letter)
        
        props.onScroll(letter, activeLetterViewTop)
    }

    function onPanResponderTerminate () {
        setActiveLetter(undefined)

        props.onScrollEnds()
    }

    function onLayout () {
        if (alphabetContainerRef && alphabetContainerRef.current) {
            alphabetContainerRef.current.measure((width, x1, y1, height, px, py) => {
                if (!containerTop && !containerHeight) {
                    containerTop = py
                    containerHeight = height
                }
            })
        }
    }

    return (
        <View
            ref={alphabetContainerRef}
            {...panResponder.panHandlers}
            onLayout={onLayout}
            style={[styles.container, props.sidebarContainerStyle]}
        >
            {
                props.letters.map((letter) => (
                    <View
                        key={letter}
                        style={[
                            props.sidebarLetterContainerStyle,
                            activeLetter === letter && props.sidebarLetterContainerActiveStyle
                        ]}
                    >
                        <Text
                            style={[
                                { fontSize: ResponsiveFontSize(1.6) },
                                props.sidebarLetterStyle, 
                                activeLetter === letter && props.sidebarLetterActiveStyle
                            ]}
                        >
                            {letter}
                        </Text>
                    </View>
                ))
            }
        </View>
    )
}

AlphabeticScrollBar.propTypes = {
    onScroll: PropTypes.func,
    onScrollEnds: PropTypes.func,
    sidebarContainerStyle: PropTypes.object,
    sidebarLetterContainerStyle: PropTypes.object,
    sidebarLetterContainerActiveStyle: PropTypes.object,
    sidebarLetterStyle: PropTypes.object,
    sidebarLetterActiveStyle: PropTypes.object,
}

export default AlphabeticScrollBar
