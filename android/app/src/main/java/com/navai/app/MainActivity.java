package com.navai.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_RECORD_AUDIO = 2001;
    private SpeechRecognizer speechRecognizer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Check & request runtime microphone permission
        checkMicPermission();

        // Setup custom WebChromeClient on Capacitor's WebView to grant audio capture
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

            webView.setWebChromeClient(new BridgeWebChromeClient(bridge) {
                @Override
                public void onPermissionRequest(PermissionRequest request) {
                    if (request != null) {
                        request.grant(request.getResources());
                    }
                }
            });

            // Register native Speech Recognizer bridge for JavaScript
            webView.addJavascriptInterface(new AndroidSpeechInterface(), "AndroidNativeSpeech");
        }
    }

    private boolean checkMicPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, PERMISSION_REQUEST_RECORD_AUDIO);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_RECORD_AUDIO) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().post(() -> {
                    bridge.getWebView().evaluateJavascript(
                        "if (window.onAndroidMicPermissionResult) { window.onAndroidMicPermissionResult(" + granted + "); }",
                        null
                    );
                });
            }
        }
    }

    public class AndroidSpeechInterface {
        @JavascriptInterface
        public boolean isAvailable() {
            return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
        }

        @JavascriptInterface
        public boolean hasPermission() {
            return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestPermission() {
            runOnUiThread(() -> checkMicPermission());
        }

        @JavascriptInterface
        public void startListening(final String langTag) {
            runOnUiThread(() -> {
                if (!checkMicPermission()) {
                    evaluateJs("window.onAndroidSpeechError('Microphone permission required. Please allow microphone access.')");
                    evaluateJs("window.onAndroidSpeechState('idle')");
                    return;
                }

                try {
                    if (speechRecognizer != null) {
                        speechRecognizer.destroy();
                        speechRecognizer = null;
                    }

                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(MainActivity.this);
                    speechRecognizer.setRecognitionListener(new RecognitionListener() {
                        @Override
                        public void onReadyForSpeech(Bundle params) {
                            evaluateJs("window.onAndroidSpeechState('listening')");
                        }

                        @Override
                        public void onBeginningOfSpeech() {
                            evaluateJs("window.onAndroidSpeechState('speaking')");
                        }

                        @Override
                        public void onRmsChanged(float rmsdB) {}

                        @Override
                        public void onBufferReceived(byte[] buffer) {}

                        @Override
                        public void onEndOfSpeech() {
                            evaluateJs("window.onAndroidSpeechState('processing')");
                        }

                        @Override
                        public void onError(int error) {
                            String message = getErrorMessage(error);
                            evaluateJs("window.onAndroidSpeechError('" + escapeJs(message) + "')");
                            evaluateJs("window.onAndroidSpeechState('idle')");
                        }

                        @Override
                        public void onResults(Bundle results) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String text = matches.get(0);
                                evaluateJs("window.onAndroidSpeechResult('" + escapeJs(text) + "')");
                            } else {
                                evaluateJs("window.onAndroidSpeechError('No speech recognized')");
                            }
                            evaluateJs("window.onAndroidSpeechState('idle')");
                        }

                        @Override
                        public void onPartialResults(Bundle partialResults) {
                            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String text = matches.get(0);
                                evaluateJs("window.onAndroidSpeechPartialResult('" + escapeJs(text) + "')");
                            }
                        }

                        @Override
                        public void onEvent(int eventType, Bundle params) {}
                    });

                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                    if (langTag != null && !langTag.trim().isEmpty()) {
                        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, langTag.trim());
                        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, langTag.trim());
                    }

                    speechRecognizer.startListening(intent);
                } catch (Exception e) {
                    evaluateJs("window.onAndroidSpeechError('" + escapeJs(e.getMessage()) + "')");
                    evaluateJs("window.onAndroidSpeechState('idle')");
                }
            });
        }

        @JavascriptInterface
        public void stopListening() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.stopListening();
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void cancelListening() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.cancel();
                        speechRecognizer.destroy();
                        speechRecognizer = null;
                    } catch (Exception ignored) {}
                }
                evaluateJs("window.onAndroidSpeechState('idle')");
            });
        }
    }

    private void evaluateJs(final String jsCode) {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "try { " + jsCode + "; } catch (e) { console.error('AndroidSpeech JS error:', e); }",
                    null
                );
            });
        }
    }

    private String escapeJs(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("'", "\\'").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }

    private String getErrorMessage(int errorCode) {
        switch (errorCode) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "Audio recording error";
            case SpeechRecognizer.ERROR_CLIENT:
                return "Client side error";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Insufficient microphone permissions";
            case SpeechRecognizer.ERROR_NETWORK:
                return "Network connection error";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Network timeout";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "No matching speech heard. Try again.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "Recognition service busy";
            case SpeechRecognizer.ERROR_SERVER:
                return "Server error";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "No speech detected";
            default:
                return "Speech recognition error (" + errorCode + ")";
        }
    }

    @Override
    public void onDestroy() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        super.onDestroy();
    }
}
