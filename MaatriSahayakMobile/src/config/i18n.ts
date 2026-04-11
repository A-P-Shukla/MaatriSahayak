import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Hindi translations for the entire app
const resources = {
    hi: {
        translation: {
            // Common
            common: {
                loading: 'लोड हो रहा है...',
                error: 'त्रुटि',
                success: 'सफलता',
                cancel: 'रद्द करें',
                save: 'सहेजें',
                submit: 'जमा करें',
                delete: 'हटाएं',
                edit: 'संपादित करें',
                back: 'वापस',
                next: 'आगे',
                done: 'पूर्ण',
                yes: 'हां',
                no: 'नहीं',
                ok: 'ठीक है',
                search: 'खोजें',
                filter: 'फ़िल्टर',
                refresh: 'रीफ्रेश करें',
                logout: 'लॉग आउट',
                retry: 'पुनः प्रयास करें',
            },

            // Auth screens
            auth: {
                login: 'लॉगिन',
                register: 'पंजीकरण',
                email: 'ईमेल',
                password: 'पासवर्ड',
                confirmPassword: 'पासवर्ड की पुष्टि करें',
                forgotPassword: 'पासवर्ड भूल गए?',
                dontHaveAccount: 'खाता नहीं है?',
                alreadyHaveAccount: 'पहले से खाता है?',
                signIn: 'साइन इन करें',
                signUp: 'साइन अप करें',
                name: 'नाम',
                phone: 'फोन नंबर',
                district: 'जिला',
                ashaId: 'आशा आईडी',
                loginSuccess: 'लॉगिन सफल',
                loginError: 'लॉगिन विफल',
                registerSuccess: 'पंजीकरण सफल',
                registerError: 'पंजीकरण विफल',
            },

            // Home screen
            home: {
                title: 'मातृ सहायक',
                welcome: 'स्वागत है',
                dashboard: 'डैशबोर्ड',
                pregnancies: 'गर्भावस्थाएं',
                emergencies: 'आपातकाल',
                vitals: 'जीवन संकेत',
                profile: 'प्रोफ़ाइल',
                totalPregnancies: 'कुल गर्भावस्थाएं',
                highRisk: 'उच्च जोखिम',
                activeEmergencies: 'सक्रिय आपातकाल',
                recentActivity: 'हाल की गतिविधि',
                quickActions: 'त्वरित कार्य',
                registerPregnancy: 'नई गर्भावस्था पंजीकृत करें',
                recordVitals: 'जीवन संकेत दर्ज करें',
                triggerEmergency: 'आपातकाल शुरू करें',
            },

            // Pregnancy screens
            pregnancy: {
                title: 'गर्भावस्थाएं',
                list: 'गर्भावस्था सूची',
                details: 'गर्भावस्था विवरण',
                register: 'नई गर्भावस्था पंजीकृत करें',
                patientName: 'रोगी का नाम',
                age: 'आयु',
                lmp: 'अंतिम मासिक धर्म',
                edd: 'अनुमानित प्रसव तिथि',
                gestationalAge: 'गर्भकालीन आयु',
                weeks: 'सप्ताह',
                riskLevel: 'जोखिम स्तर',
                status: 'स्थिति',
                active: 'सक्रिय',
                completed: 'पूर्ण',
                highRiskPregnancy: 'उच्च जोखिम गर्भावस्था',
                normalPregnancy: 'सामान्य गर्भावस्था',
                medicalHistory: 'चिकित्सा इतिहास',
                previousComplications: 'पिछली जटिलताएं',
                diabetes: 'मधुमेह',
                hypertension: 'उच्च रक्तचाप',
                anemia: 'एनीमिया',
                registerSuccess: 'गर्भावस्था सफलतापूर्वक पंजीकृत',
                registerError: 'पंजीकरण विफल',
            },

            // Pregnancy List screen
            pregnancyList: {
                title: 'गर्भावस्था मामले',
                searchPlaceholder: 'नाम या फोन से खोजें...',
            },

            // Vitals screen
            vitals: {
                title: 'जीवन संकेत',
                record: 'जीवन संकेत दर्ज करें',
                history: 'जीवन संकेत इतिहास',
                bloodPressure: 'रक्तचाप',
                systolic: 'सिस्टोलिक',
                diastolic: 'डायस्टोलिक',
                heartRate: 'हृदय गति',
                temperature: 'तापमान',
                weight: 'वजन',
                bloodSugar: 'रक्त शर्करा',
                hemoglobin: 'हीमोग्लोबिन',
                oxygenSaturation: 'ऑक्सीजन संतृप्ति',
                fetalHeartRate: 'भ्रूण हृदय गति',
                notes: 'टिप्पणियां',
                recordedAt: 'दर्ज किया गया',
                recordSuccess: 'जीवन संकेत सफलतापूर्वक दर्ज',
                recordError: 'दर्ज करने में विफल',
                bpm: 'बीपीएम',
                mmHg: 'mmHg',
                celsius: '°C',
                kg: 'किलो',
                mgdl: 'mg/dL',
                gdl: 'g/dL',
                percent: '%',
                // Additional vitals translations
                patient: 'रोगी',
                vitalSigns: 'जीवन संकेत',
                bpSystolic: 'रक्तचाप सिस्टोलिक (mmHg)',
                bpDiastolic: 'रक्तचाप डायस्टोलिक (mmHg)',
                bpSystolicPlaceholder: 'जैसे 120',
                bpDiastolicPlaceholder: 'जैसे 80',
                weightPlaceholder: 'जैसे 58',
                hemoglobinPlaceholder: 'जैसे 11.5',
                temperaturePlaceholder: 'जैसे 37.0',
                heartRatePlaceholder: 'जैसे 78',
                oxygenSaturationPlaceholder: 'जैसे 98',
                notesPlaceholder: 'कोई टिप्पणी या अवलोकन...',
                saveButton: 'जीवन संकेत सहेजें',
                saved: 'सहेजा गया',
                successMessage: 'जीवन संकेत सफलतापूर्वक दर्ज किए गए।',
                missingFields: 'आवश्यक फ़ील्ड',
                bpRequired: 'रक्तचाप (सिस्टोलिक और डायस्टोलिक) आवश्यक है।',
                invalidValues: 'अमान्य मान',
                validBpPrompt: 'कृपया वैध रक्तचाप मान दर्ज करें।',
                noPregnancy: 'कोई गर्भावस्था चयनित नहीं। कृपया वापस जाएं और एक रोगी चुनें।',
            },

            // Emergency screen
            emergency: {
                title: 'आपातकाल',
                trigger: 'आपातकाल शुरू करें',
                active: 'सक्रिय आपातकाल',
                history: 'आपातकाल इतिहास',
                type: 'आपातकाल प्रकार',
                severity: 'गंभीरता',
                description: 'विवरण',
                location: 'स्थान',
                status: 'स्थिति',
                initiated: 'शुरू किया गया',
                dispatched: 'भेजा गया',
                enroute: 'रास्ते में',
                arrived: 'पहुंच गया',
                completed: 'पूर्ण',
                cancelled: 'रद्द',
                severeBleed: 'गंभीर रक्तस्राव',
                highBP: 'उच्च रक्तचाप आपातकाल',
                seizure: 'दौरा',
                laborComplications: 'प्रसव जटिलताएं',
                fetalDistress: 'भ्रूण संकट',
                other: 'अन्य',
                critical: 'गंभीर',
                high: 'उच्च',
                medium: 'मध्यम',
                low: 'निम्न',
                ambulanceDispatched: 'एम्बुलेंस भेजी गई',
                hospitalAlerted: 'अस्पताल को सूचित किया गया',
                estimatedArrival: 'अनुमानित आगमन',
                triggerSuccess: 'आपातकाल सफलतापूर्वक शुरू',
                triggerError: 'आपातकाल शुरू करने में विफल',
                confirmTrigger: 'क्या आप आपातकाल शुरू करना चाहते हैं?',
                emergencyTriggered: 'आपातकाल शुरू किया गया',
            },

            // Profile screen
            profile: {
                title: 'प्रोफ़ाइल',
                personalInfo: 'व्यक्तिगत जानकारी',
                workInfo: 'कार्य जानकारी',
                settings: 'सेटिंग्स',
                language: 'भाषा',
                notifications: 'सूचनाएं',
                about: 'के बारे में',
                version: 'संस्करण',
                updateProfile: 'प्रोफ़ाइल अपडेट करें',
                changePassword: 'पासवर्ड बदलें',
                updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट',
                updateError: 'अपडेट विफल',
            },

            // Validation messages
            validation: {
                required: 'यह फ़ील्ड आवश्यक है',
                invalidEmail: 'अमान्य ईमेल पता',
                invalidPhone: 'अमान्य फोन नंबर',
                passwordMismatch: 'पासवर्ड मेल नहीं खाते',
                minLength: 'कम से कम {{count}} अक्षर होने चाहिए',
                maxLength: 'अधिकतम {{count}} अक्षर हो सकते हैं',
                invalidValue: 'अमान्य मान',
            },

            // Error messages
            errors: {
                networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
                serverError: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
                unauthorized: 'अनधिकृत। कृपया फिर से लॉगिन करें।',
                notFound: 'नहीं मिला',
                unknown: 'अज्ञात त्रुटि हुई',
                locationPermission: 'स्थान अनुमति आवश्यक है',
                cameraPermission: 'कैमरा अनुमति आवश्यक है',
            },

            // Success messages
            success: {
                saved: 'सफलतापूर्वक सहेजा गया',
                updated: 'सफलतापूर्वक अपडेट किया गया',
                deleted: 'सफलतापूर्वक हटाया गया',
                sent: 'सफलतापूर्वक भेजा गया',
            },

            // Navigation
            navigation: {
                home: 'होम',
                pregnancies: 'गर्भावस्थाएं',
                vitals: 'जीवन संकेत',
                emergency: 'आपातकाल',
                profile: 'प्रोफ़ाइल',
            },

            // Date and time
            datetime: {
                today: 'आज',
                yesterday: 'कल',
                tomorrow: 'कल',
                now: 'अभी',
                minutes: 'मिनट',
                hours: 'घंटे',
                days: 'दिन',
                weeks: 'सप्ताह',
                months: 'महीने',
                years: 'साल',
                ago: 'पहले',
            },
        },
    },
    en: {
        translation: {
            // English fallback translations
            common: {
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                cancel: 'Cancel',
                save: 'Save',
                submit: 'Submit',
                delete: 'Delete',
                edit: 'Edit',
                back: 'Back',
                next: 'Next',
                done: 'Done',
                yes: 'Yes',
                no: 'No',
                ok: 'OK',
                search: 'Search',
                filter: 'Filter',
                refresh: 'Refresh',
                logout: 'Logout',
            },
            // ... (English translations can be added as fallback)
        },
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'hi', // Default language is Hindi
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v3',
    });

export default i18n;
