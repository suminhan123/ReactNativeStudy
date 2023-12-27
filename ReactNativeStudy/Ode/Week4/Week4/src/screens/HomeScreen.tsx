import React, {useEffect, useRef} from 'react';
import Container from '../components/Container';
import WebView from 'react-native-webview';
import useLocationState from '../libraries/recoil/hooks/useLocationState';
import useBookmarkState from '../libraries/recoil/hooks/useBookmarkState';
import {Location} from '../types/location';

export default function HomeScreen() {
  const {location} = useLocationState();
  const {addBookmarks} = useBookmarkState();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    async function initializeData() {
      postMessage({type: 'init', data: location});
    }

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postMessage(message: {type: string; data: Partial<Location>}) {
    try {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Container>
      <WebView
        ref={webViewRef}
        source={{uri: 'http://172.30.1.15:3000'}}
        onMessage={event => {
          try {
            const message = JSON.parse(JSON.parse(event.nativeEvent.data));
            switch (message?.type) {
              case 'favoriteLocation': {
                console.debug(message.data);
                addBookmarks(message.data);
              }
            }
          } catch (error) {
            console.error(error);
          }
        }}
        injectedJavaScript={`(function() {
          window.sendMessageToReactNative = function(message) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            } else {
              console.error('ReactNativeWebView is not available.');
            }
          };

          var originalConsoleLog = console.log;
          console.log = function() {
            originalConsoleLog.apply(console, arguments);
            window.ReactNativeWebView.postMessage(JSON.stringify(arguments));
          };
        })();`}
        onLoadStart={() => postMessage({type: 'init', data: location})}
      />
    </Container>
  );
}
