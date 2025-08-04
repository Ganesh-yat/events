// // import React, { useEffect, useState } from 'react';
// // import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import  { pickSingle } from 'react-native-document-picker';
// // import RNFS from 'react-native-fs';
// // import Share from 'react-native-share';
// // import * as XLSX from 'xlsx';
// // import { Colors } from '../../../constants/Colors';
// // import { useGlobalInfo } from '../../../context/GlobalContext';
// // import { API_ROUTE } from '../../../lib/config/index';

// // export default function AddParticipants() {
// //     const { event: eventId, theme } = useGlobalInfo();
// //     const colors = Colors[theme];
// //     const [formExists, setFormExists] = useState(null);
// //     const [excelData, setExcelData] = useState([]);
// //     const [selectedFile, setSelectedFile] = useState(null);
// //     const [loading, setLoading] = useState(false);
// //     const [snackbar, setSnackbar] = useState({ visible: false, message: '', severity: 'info' });

// //     useEffect(() => {
// //         if (!eventId) {
// //             setFormExists(false);
// //             return;
// //         }
// //         setLoading(true);
// //         fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
// //             .then(res => {
// //                 if (res.status === 404) setFormExists(false);
// //                 else if (res.ok) setFormExists(true);
// //                 else throw new Error('Unexpected response');
// //             })
// //             .catch(() => setFormExists(false))
// //             .finally(() => setLoading(false));
// //     }, [eventId]);

// //     const showToast = (message, severity = 'info') => {
// //         setSnackbar({ visible: true, message, severity });
// //     };

// //     const handleDownloadTemplate = async () => {
// //         try {
// //             setLoading(true);
// //             const url = `${API_ROUTE}/api/v1/event/bulkRegistration/export-template/${eventId}`;
// //             const localPath = `${RNFS.CachesDirectoryPath}/template_${eventId}.xlsx`;

// //             // Download the file
// //             const download = await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;

// //             if (download.statusCode === 200) {
// //                 await Share.open({ url: `file://${localPath}` });
// //             } else {
// //                 showToast('Download complete. Sharing is not available on this device.', 'info');
// //             }
// //         } catch (err) {
// //             showToast('Error downloading template.', 'error');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };


// //     const handleFileUpload = async () => {
// //         try {
// // import { pick } from '@react-native-documents/picker';
// // const [file] = await pick(opts);
// //             const res = await DocumentPicker.pickSingle({
// //                 type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
// //             });
// //             if (!res) return;

// //             setLoading(true);

// //             setSelectedFile(res);

// //             if (!/\.(xls|xlsx)$/i.test(res.name)) {
// //                 showToast("Invalid file format. Please upload an Excel file (.xls or .xlsx)", "error");
// //                 setLoading(false);
// //                 return;
// //             }

// //             // Read file as base64, decode, parse with XLSX
// //             const fileData = await RNFS.readFile(res.uri.replace('file://', ''), 'base64');
// //             const binaryData = Buffer.from(fileData, 'base64');
// //             const workbook = XLSX.read(binaryData, { type: 'buffer' });
// //             const sheetName = workbook.SheetNames[0];
// //             const worksheet = workbook.Sheets[sheetName];
// //             const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

// //             if (!rawData.length) {
// //                 showToast("Excel file is empty or not formatted correctly.", "error");
// //                 setLoading(false);
// //                 return;
// //             }
// //             setExcelData(rawData);
// //             showToast("File loaded. Preview below.", "success");
// //         } catch (err) {
// //             if (!DocumentPicker.isCancel(err)) {
// //                 showToast("Upload failed. Server error.", "error");
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     };


// //     const handleGenerateTickets = async () => {
// //         if (!selectedFile || !excelData.length) return;
// //         setLoading(true);
// //         try {
// //             // Convert JSON back to xlsx to send as file (in-memory)
// //             const ws = XLSX.utils.json_to_sheet(excelData);
// //             const wb = XLSX.utils.book_new();
// //             XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
// //             const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

// //             // Save temp file
// //             const uploadUri = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.xlsx`;
// //             await RNFS.writeFile(uploadUri, wbout, 'base64');

// //             // Prepare FormData for upload
// //             const formData = new FormData();
// //             formData.append('file', {
// //                 uri: `file://${uploadUri}`,
// //                 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// //                 name: selectedFile.name || 'participants.xlsx'
// //             });

// //             const res = await fetch(
// //                 `${API_ROUTE}/api/v1/event/bulkRegistration/import-template/${eventId}`,
// //                 {
// //                     method: 'POST',
// //                     headers: {
// //                         'Content-Type': 'multipart/form-data'
// //                     },
// //                     body: formData,
// //                 }
// //             );
// //             const result = await res.json();

// //             if (!res.ok) throw new Error(result?.error || "Failed to generate tickets");
// //             showToast(`Successfully generated ${result.count} tickets`, "success");
// //             setExcelData([]);
// //             setSelectedFile(null);
// //         } catch (err) {
// //             showToast(err.message, "error");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };


// //     if (formExists === null || loading) {
// //         return (
// //             <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
// //                 <ActivityIndicator color={colors.button} size="large" />
// //                 <Text style={{ marginTop: 18, color: colors.text, fontWeight: 'bold' }}>Loading...</Text>
// //             </View>
// //         );
// //     }

// //     if (!formExists) {
// //         return (
// //             <View style={[styles.noFormBox, { backgroundColor: colors.background }]}>
// //                 <Text style={[styles.noFormTitle, { color: colors.button }]}>
// //                     No registration form found
// //                 </Text>
// //                 <Text style={[styles.noFormText, { color: colors.text }]}>
// //                     Please create a registration form first before adding participants.
// //                 </Text>
// //             </View>
// //         );
// //     }

// //     return (
// //         <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
// //             <Text style={[styles.title, { color: colors.button }]}>Bulk Registration</Text>
// //             <Text style={[styles.description, { color: colors.text }]}>
// //                 Issue tickets to your Participants without asking them to register online.
// //             </Text>
// //             <Text style={[styles.warning, { color: colors.cancelButton }]}>
// //                 Participants will receive email, SMS and WhatsApp notifications after registration.
// //             </Text>

// //             <View style={[styles.card, { backgroundColor: colors.card }]}>
// //                 <Text style={[styles.note, { color: colors.secondaryText }]}>
// //                     NOTE: Please download and use the sample Excel file.
// //                 </Text>

// //                 <TouchableOpacity onPress={handleDownloadTemplate} style={[styles.downloadButton, { backgroundColor: colors.dropdownBackground }]}>
// //                     <Text style={[styles.downloadText, { color: colors.button }]}>⬇️ Download sample Excel</Text>
// //                 </TouchableOpacity>

// //                 <Text style={[styles.note, { color: colors.cancelButton }]}>
// //                     Fill the downloaded file and upload it with your participant data.
// //                 </Text>

// //                 <TouchableOpacity
// //                     style={[
// //                         styles.uploadBox,
// //                         {
// //                             borderColor: colors.button,
// //                             backgroundColor: colors.dropdownBackground
// //                         }
// //                     ]}
// //                     onPress={handleFileUpload}
// //                 >
// //                     <Text style={[styles.uploadIcon, { color: colors.button }]}>📤</Text>
// //                     <Text style={[styles.uploadText, { color: colors.button }]}>Tap here to upload your Excel file</Text>
// //                     <Text style={[styles.uploadNote, { color: colors.secondaryText }]}>Max file size: 1 MB</Text>
// //                 </TouchableOpacity>
// //             </View>

// //             {excelData.length > 0 && (
// //                 <View style={styles.previewBox}>
// //                     <Text style={[styles.previewTitle, { color: colors.text }]}>Uploaded Preview:</Text>
// //                     <ScrollView horizontal style={[styles.tablePreview, { backgroundColor: colors.dropdownBackground }]}>
// //                         <View>
// //                             {/* Table Head */}
// //                             <View style={styles.previewTableRow}>
// //                                 {Object.keys(excelData[0]).map(key => (
// //                                     <Text key={key} style={[styles.previewTableCell, styles.previewTableHeader, { color: colors.button }]} numberOfLines={1} ellipsizeMode="tail">{key}</Text>
// //                                 ))}
// //                             </View>
// //                             {/* Table Body */}
// //                             <ScrollView style={{ maxHeight: 220 }}>
// //                                 {excelData.map((row, i) => (
// //                                     <View key={i} style={styles.previewTableRow}>
// //                                         {Object.values(row).map((val, j) => (
// //                                             <Text
// //                                                 key={j}
// //                                                 style={[styles.previewTableCell, { color: colors.text }]}
// //                                                 numberOfLines={1}
// //                                                 ellipsizeMode="tail"
// //                                             >
// //                                                 {val}
// //                                             </Text>
// //                                         ))}
// //                                     </View>
// //                                 ))}
// //                             </ScrollView>
// //                         </View>
// //                     </ScrollView>
// //                     <TouchableOpacity
// //                         onPress={handleGenerateTickets}
// //                         disabled={loading}
// //                         style={[
// //                             styles.generateBtn,
// //                             { backgroundColor: colors.button, opacity: loading ? 0.7 : 1 }
// //                         ]}
// //                     >
// //                         {loading
// //                             ? <ActivityIndicator color={colors.buttonText} size="small" />
// //                             : <Text style={{ color: colors.buttonText, fontWeight: 'bold' }}>Generate Tickets</Text>
// //                         }
// //                     </TouchableOpacity>
// //                 </View>
// //             )}

// //             {/* Snackbar/Toast */}
// //             {snackbar.visible && (
// //                 <View style={[
// //                     styles.snackbar,
// //                     {
// //                         backgroundColor: snackbar.severity === "success"
// //                             ? colors.button
// //                             : snackbar.severity === "error"
// //                                 ? colors.cancelButton
// //                                 : colors.dropdownBackground
// //                     }
// //                 ]}>
// //                     <Text style={{ color: colors.buttonText }}>{snackbar.message}</Text>
// //                 </View>
// //             )}
// //         </ScrollView>
// //     );
// // }


// ======================================================================================>>>>>>>>>>>>>>>>>>>>>



// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { pickSingle, types as DocumentTypes, isCancel } from 'react-native-document-picker';
// // import { pick, types as DocumentTypes, isCancel } from '@react-native-documents/picker';
// import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
// import * as XLSX from 'xlsx';
// import { Colors } from '../../../constants/Colors';
// import { useGlobalInfo } from '../../../context/GlobalContext';
// import { API_ROUTE } from '../../../lib/config/index';

// export default function AddParticipants() {
//     const { event: eventId, theme } = useGlobalInfo();
//     const colors = Colors[theme];
//     const [formExists, setFormExists] = useState(null);
//     const [excelData, setExcelData] = useState([]);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [snackbar, setSnackbar] = useState({ visible: false, message: '', severity: 'info' });

//     useEffect(() => {
//         if (!eventId) {
//             setFormExists(false);
//             return;
//         }
//         setLoading(true);
//         fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
//             .then(res => {
//                 if (res.status === 404) setFormExists(false);
//                 else if (res.ok) setFormExists(true);
//                 else throw new Error('Unexpected response');
//             })
//             .catch(() => setFormExists(false))
//             .finally(() => setLoading(false));
//     }, [eventId]);

//     const showToast = (message, severity = 'info') => {
//         setSnackbar({ visible: true, message, severity });
//         setTimeout(() => setSnackbar({ visible: false, message: '', severity: 'info' }), 3500);
//     };

//     const handleDownloadTemplate = async () => {
//         try {
//             setLoading(true);
//             const url = `${API_ROUTE}/api/v1/event/bulkRegistration/export-template/${eventId}`;
//             const localPath = `${RNFS.CachesDirectoryPath}/template_${eventId}.xlsx`;
//             const download = await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;

//             if (download.statusCode === 200) {
//                 await Share.open({ url: `file://${localPath}` });
//             } else {
//                 showToast('Download complete. Sharing is not available on this device.', 'info');
//             }
//         } catch (err) {
//             showToast('Error downloading template.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- This is the rewritten file upload using ONLY pickSingle ---
//     const handleFileUpload = async () => {
//         try {
//             const res = await pickSingle({
//                 type: [
//                     DocumentTypes.xlsx,
//                     DocumentTypes.xls,
//                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                     'application/vnd.ms-excel'
//                 ],
//                 copyTo: 'cachesDirectory', // safer, ensures local access
//             });
//             if (!res) return;

//             setLoading(true);
//             setSelectedFile(res);

//             if (!/\.(xls|xlsx)$/i.test(res.name)) {
//                 showToast("Invalid file format. Please upload an Excel file (.xls or .xlsx)", "error");
//                 setLoading(false);
//                 return;
//             }

//             // Use res.fileCopyUri if present (guaranteed local path)
//             const fileUri = (res.fileCopyUri || res.uri).replace('file://', '');
//             const fileData = await RNFS.readFile(fileUri, 'base64');
//             const binaryData = Buffer.from(fileData, 'base64');
//             const workbook = XLSX.read(binaryData, { type: 'buffer' });
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

//             if (!rawData.length) {
//                 showToast("Excel file is empty or not formatted correctly.", "error");
//                 setLoading(false);
//                 return;
//             }
//             setExcelData(rawData);
//             showToast("File loaded. Preview below.", "success");
//         } catch (err) {
//             if (!isCancel(err)) {
//                 showToast("Upload failed. Server error.", "error");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleGenerateTickets = async () => {
//         if (!selectedFile || !excelData.length) return;
//         setLoading(true);
//         try {
//             // Convert JSON back to xlsx to send as file (in-memory)
//             const ws = XLSX.utils.json_to_sheet(excelData);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//             const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

//             // Save temp file
//             const uploadUri = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.xlsx`;
//             await RNFS.writeFile(uploadUri, wbout, 'base64');

//             // Prepare FormData for upload
//             const formData = new FormData();
//             formData.append('file', {
//                 uri: `file://${uploadUri}`,
//                 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                 name: selectedFile.name || 'participants.xlsx'
//             });

//             const res = await fetch(
//                 `${API_ROUTE}/api/v1/event/bulkRegistration/import-template/${eventId}`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     },
//                     body: formData,
//                 }
//             );
//             const result = await res.json();

//             if (!res.ok) throw new Error(result?.error || "Failed to generate tickets");
//             showToast(`Successfully generated ${result.count} tickets`, "success");
//             setExcelData([]);
//             setSelectedFile(null);
//         } catch (err) {
//             showToast(err.message, "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (formExists === null || loading) {
//         return (
//             <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
//                 <ActivityIndicator color={colors.button} size="large" />
//                 <Text style={{ marginTop: 18, color: colors.text, fontWeight: 'bold' }}>Loading...</Text>
//             </View>
//         );
//     }

//     if (!formExists) {
//         return (
//             <View style={[styles.noFormBox, { backgroundColor: colors.background }]}>
//                 <Text style={[styles.noFormTitle, { color: colors.button }]}>
//                     No registration form found
//                 </Text>
//                 <Text style={[styles.noFormText, { color: colors.text }]}>
//                     Please create a registration form first before adding participants.
//                 </Text>
//             </View>
//         );
//     }

//     return (
//         <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
//             <Text style={[styles.title, { color: colors.button }]}>Bulk Registration</Text>
//             <Text style={[styles.description, { color: colors.text }]}>
//                 Issue tickets to your Participants without asking them to register online.
//             </Text>
//             <Text style={[styles.warning, { color: colors.cancelButton }]}>
//                 Participants will receive email, SMS and WhatsApp notifications after registration.
//             </Text>

//             <View style={[styles.card, { backgroundColor: colors.card }]}>
//                 <Text style={[styles.note, { color: colors.secondaryText }]}>
//                     NOTE: Please download and use the sample Excel file.
//                 </Text>

//                 <TouchableOpacity onPress={handleDownloadTemplate} style={[styles.downloadButton, { backgroundColor: colors.dropdownBackground }]}>
//                     <Text style={[styles.downloadText, { color: colors.button }]}>⬇️ Download sample Excel</Text>
//                 </TouchableOpacity>

//                 <Text style={[styles.note, { color: colors.cancelButton }]}>
//                     Fill the downloaded file and upload it with your participant data.
//                 </Text>

//                 <TouchableOpacity
//                     style={[
//                         styles.uploadBox,
//                         {
//                             borderColor: colors.button,
//                             backgroundColor: colors.dropdownBackground
//                         }
//                     ]}
//                     onPress={handleFileUpload}
//                 >
//                     <Text style={[styles.uploadIcon, { color: colors.button }]}>📤</Text>
//                     <Text style={[styles.uploadText, { color: colors.button }]}>Tap here to upload your Excel file</Text>
//                     <Text style={[styles.uploadNote, { color: colors.secondaryText }]}>Max file size: 1 MB</Text>
//                 </TouchableOpacity>
//             </View>

//             {excelData.length > 0 && (
//                 <View style={styles.previewBox}>
//                     <Text style={[styles.previewTitle, { color: colors.text }]}>Uploaded Preview:</Text>
//                     <ScrollView horizontal style={[styles.tablePreview, { backgroundColor: colors.dropdownBackground }]}>
//                         <View>
//                             {/* Table Head */}
//                             <View style={styles.previewTableRow}>
//                                 {Object.keys(excelData[0]).map(key => (
//                                     <Text key={key} style={[styles.previewTableCell, styles.previewTableHeader, { color: colors.button }]} numberOfLines={1} ellipsizeMode="tail">{key}</Text>
//                                 ))}
//                             </View>
//                             {/* Table Body */}
//                             <ScrollView style={{ maxHeight: 220 }}>
//                                 {excelData.map((row, i) => (
//                                     <View key={i} style={styles.previewTableRow}>
//                                         {Object.values(row).map((val, j) => (
//                                             <Text
//                                                 key={j}
//                                                 style={[styles.previewTableCell, { color: colors.text }]}
//                                                 numberOfLines={1}
//                                                 ellipsizeMode="tail"
//                                             >
//                                                 {val}
//                                             </Text>
//                                         ))}
//                                     </View>
//                                 ))}
//                             </ScrollView>
//                         </View>
//                     </ScrollView>
//                     <TouchableOpacity
//                         onPress={handleGenerateTickets}
//                         disabled={loading}
//                         style={[
//                             styles.generateBtn,
//                             { backgroundColor: colors.button, opacity: loading ? 0.7 : 1 }
//                         ]}
//                     >
//                         {loading
//                             ? <ActivityIndicator color={colors.buttonText} size="small" />
//                             : <Text style={{ color: colors.buttonText, fontWeight: 'bold' }}>Generate Tickets</Text>
//                         }
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {/* Snackbar/Toast */}
//             {snackbar.visible && (
//                 <View style={[
//                     styles.snackbar,
//                     {
//                         backgroundColor: snackbar.severity === "success"
//                             ? colors.button
//                             : snackbar.severity === "error"
//                                 ? colors.cancelButton
//                                 : colors.dropdownBackground
//                     }
//                 ]}>
//                     <Text style={{ color: colors.buttonText }}>{snackbar.message}</Text>
//                 </View>
//             )}
//         </ScrollView>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//         padding: 16,
//         flexGrow: 1
//     },
//     noFormBox: {
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 32,
//     },
//     noFormTitle: {
//         fontWeight: "bold",
//         fontSize: 20,
//         marginBottom: 10,
//     },
//     noFormText: {
//         fontSize: 14,
//         textAlign: "center",
//         maxWidth: 300,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 8,
//     },
//     description: {
//         marginBottom: 4,
//         fontSize: 15,
//     },
//     warning: {
//         marginBottom: 16,
//         fontSize: 13,
//         fontWeight: 'bold'
//     },
//     card: {
//         borderRadius: 8,
//         marginBottom: 16,
//         elevation: 2,
//         padding: 14,
//     },
//     note: {
//         marginBottom: 8,
//         fontSize: 14,
//     },
//     downloadButton: {
//         padding: 10,
//         borderRadius: 4,
//         marginBottom: 8,
//         alignSelf: 'flex-start',
//     },
//     downloadText: {
//         textAlign: 'center',
//         fontWeight: 'bold'
//     },
//     uploadBox: {
//         borderWidth: 2,
//         borderStyle: 'dashed',
//         borderRadius: 8,
//         padding: 24,
//         alignItems: 'center',
//         marginTop: 12,
//     },
//     uploadIcon: {
//         fontSize: 32,
//         marginBottom: 8,
//     },
//     uploadText: {
//         textDecorationLine: 'underline',
//         marginBottom: 4,
//         fontSize: 15,
//         fontWeight: 'bold'
//     },
//     uploadNote: {
//         fontSize: 12,
//     },
//     previewBox: {
//         marginTop: 18,
//         paddingBottom: 16
//     },
//     previewTitle: {
//         fontSize: 18,
//         marginBottom: 10,
//         fontWeight: 'bold'
//     },
//     tablePreview: {
//         borderRadius: 6,
//         minHeight: 60,
//         padding: 10,
//         marginBottom: 14,
//         maxWidth: '100%',
//     },
//     previewTableRow: {
//         flexDirection: 'row',
//         minHeight: 32,
//         alignItems: 'center'
//     },
//     previewTableHeader: {
//         fontWeight: 'bold',
//         fontSize: 13
//     },
//     previewTableCell: {
//         fontSize: 13,
//         paddingHorizontal: 12,
//         paddingVertical: 4,
//         minWidth: 80,
//         maxWidth: 120,
//     },
//     generateBtn: {
//         marginTop: 10,
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 46
//     },
//     snackbar: {
//         position: "absolute",
//         bottom: 28,
//         left: 20,
//         right: 20,
//         borderRadius: 6,
//         padding: 12,
//         alignItems: 'center',
//         elevation: 3,
//         zIndex: 100,
//     },
// });

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BulkTicket() {
    return (
        <View style={styles.container}>
            <Text>BulkTicket</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});



// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { pick, types as DocumentTypes } from '@react-native-documents/picker';
// import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
// import * as XLSX from 'xlsx';
// import { Colors } from '../../../constants/Colors';
// import { useGlobalInfo } from '../../../context/GlobalContext';
// import { API_ROUTE } from '../../../lib/config/index';

// export default function AddParticipants() {
//     const { event: eventId, theme } = useGlobalInfo();
//     const colors = Colors[theme];
//     const [formExists, setFormExists] = useState(null);
//     const [excelData, setExcelData] = useState([]);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [snackbar, setSnackbar] = useState({ visible: false, message: '', severity: 'info' });

//     useEffect(() => {
//         if (!eventId) {
//             setFormExists(false);
//             return;
//         }
//         setLoading(true);
//         fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
//             .then(res => {
//                 if (res.status === 404) setFormExists(false);
//                 else if (res.ok) setFormExists(true);
//                 else throw new Error('Unexpected response');
//             })
//             .catch(() => setFormExists(false))
//             .finally(() => setLoading(false));
//     }, [eventId]);

//     const showToast = (message, severity = 'info') => {
//         setSnackbar({ visible: true, message, severity });
//         setTimeout(() => setSnackbar({ visible: false, message: '', severity: 'info' }), 3500);
//     };

//     const handleDownloadTemplate = async () => {
//         try {
//             setLoading(true);
//             const url = `${API_ROUTE}/api/v1/event/bulkRegistration/export-template/${eventId}`;
//             const localPath = `${RNFS.CachesDirectoryPath}/template_${eventId}.xlsx`;
//             const download = await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;

//             if (download.statusCode === 200) {
//                 await Share.open({ url: `file://${localPath}` });
//             } else {
//                 showToast('Download complete. Sharing is not available on this device.', 'info');
//             }
//         } catch (err) {
//             showToast('Error downloading template.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Updated file upload for @react-native-documents/picker
//     const handleFileUpload = async () => {
//         try {
//             const files = await pick({
//                 type: [
//                     DocumentTypes.xlsx,
//                     DocumentTypes.xls,
//                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                     'application/vnd.ms-excel'
//                 ],
//                 copyTo: 'cachesDirectory',
//             });

//             // @react-native-documents/picker returns an array by default
//             const res = Array.isArray(files) ? files[0] : files;
//             if (!res) return;

//             setLoading(true);
//             setSelectedFile(res);

//             if (!/\.(xls|xlsx)$/i.test(res.name)) {
//                 showToast("Invalid file format. Please upload an Excel file (.xls or .xlsx)", "error");
//                 setLoading(false);
//                 return;
//             }

//             // Use res.fileCopyUri if present (guaranteed local path)
//             const fileUri = (res.fileCopyUri || res.uri).replace('file://', '');
//             const fileData = await RNFS.readFile(fileUri, 'base64');
//             const binaryData = Buffer.from(fileData, 'base64');
//             const workbook = XLSX.read(binaryData, { type: 'buffer' });
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

//             if (!rawData.length) {
//                 showToast("Excel file is empty or not formatted correctly.", "error");
//                 setLoading(false);
//                 return;
//             }
//             setExcelData(rawData);
//             showToast("File loaded. Preview below.", "success");
//         } catch (err) {
//             if (err && err.code === 'DOCUMENT_PICKER_CANCELED') {
//                 // User canceled, do nothing
//                 return;
//             }
//             showToast("Upload failed. Server error.", "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleGenerateTickets = async () => {
//         if (!selectedFile || !excelData.length) return;
//         setLoading(true);
//         try {
//             // Convert JSON back to xlsx to send as file (in-memory)
//             const ws = XLSX.utils.json_to_sheet(excelData);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//             const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

//             // Save temp file
//             const uploadUri = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.xlsx`;
//             await RNFS.writeFile(uploadUri, wbout, 'base64');

//             // Prepare FormData for upload
//             const formData = new FormData();
//             formData.append('file', {
//                 uri: `file://${uploadUri}`,
//                 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                 name: selectedFile.name || 'participants.xlsx'
//             });

//             const res = await fetch(
//                 `${API_ROUTE}/api/v1/event/bulkRegistration/import-template/${eventId}`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     },
//                     body: formData,
//                 }
//             );
//             const result = await res.json();

//             if (!res.ok) throw new Error(result?.error || "Failed to generate tickets");
//             showToast(`Successfully generated ${result.count} tickets`, "success");
//             setExcelData([]);
//             setSelectedFile(null);
//         } catch (err) {
//             showToast(err.message, "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (formExists === null || loading) {
//         return (
//             <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
//                 <ActivityIndicator color={colors.button} size="large" />
//                 <Text style={{ marginTop: 18, color: colors.text, fontWeight: 'bold' }}>Loading...</Text>
//             </View>
//         );
//     }

//     if (!formExists) {
//         return (
//             <View style={[styles.noFormBox, { backgroundColor: colors.background }]}>
//                 <Text style={[styles.noFormTitle, { color: colors.button }]}>
//                     No registration form found
//                 </Text>
//                 <Text style={[styles.noFormText, { color: colors.text }]}>
//                     Please create a registration form first before adding participants.
//                 </Text>
//             </View>
//         );
//     }

//     return (
//         <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
//             <Text style={[styles.title, { color: colors.button }]}>Bulk Registration</Text>
//             <Text style={[styles.description, { color: colors.text }]}>
//                 Issue tickets to your Participants without asking them to register online.
//             </Text>
//             <Text style={[styles.warning, { color: colors.cancelButton }]}>
//                 Participants will receive email, SMS and WhatsApp notifications after registration.
//             </Text>

//             <View style={[styles.card, { backgroundColor: colors.card }]}>
//                 <Text style={[styles.note, { color: colors.secondaryText }]}>
//                     NOTE: Please download and use the sample Excel file.
//                 </Text>

//                 <TouchableOpacity onPress={handleDownloadTemplate} style={[styles.downloadButton, { backgroundColor: colors.dropdownBackground }]}>
//                     <Text style={[styles.downloadText, { color: colors.button }]}>⬇️ Download sample Excel</Text>
//                 </TouchableOpacity>

//                 <Text style={[styles.note, { color: colors.cancelButton }]}>
//                     Fill the downloaded file and upload it with your participant data.
//                 </Text>

//                 <TouchableOpacity
//                     style={[
//                         styles.uploadBox,
//                         {
//                             borderColor: colors.button,
//                             backgroundColor: colors.dropdownBackground
//                         }
//                     ]}
//                     onPress={handleFileUpload}
//                 >
//                     <Text style={[styles.uploadIcon, { color: colors.button }]}>📤</Text>
//                     <Text style={[styles.uploadText, { color: colors.button }]}>Tap here to upload your Excel file</Text>
//                     <Text style={[styles.uploadNote, { color: colors.secondaryText }]}>Max file size: 1 MB</Text>
//                 </TouchableOpacity>
//             </View>

//             {excelData.length > 0 && (
//                 <View style={styles.previewBox}>
//                     <Text style={[styles.previewTitle, { color: colors.text }]}>Uploaded Preview:</Text>
//                     <ScrollView horizontal style={[styles.tablePreview, { backgroundColor: colors.dropdownBackground }]}>
//                         <View>
//                             {/* Table Head */}
//                             <View style={styles.previewTableRow}>
//                                 {Object.keys(excelData[0]).map(key => (
//                                     <Text key={key} style={[styles.previewTableCell, styles.previewTableHeader, { color: colors.button }]} numberOfLines={1} ellipsizeMode="tail">{key}</Text>
//                                 ))}
//                             </View>
//                             {/* Table Body */}
//                             <ScrollView style={{ maxHeight: 220 }}>
//                                 {excelData.map((row, i) => (
//                                     <View key={i} style={styles.previewTableRow}>
//                                         {Object.values(row).map((val, j) => (
//                                             <Text
//                                                 key={j}
//                                                 style={[styles.previewTableCell, { color: colors.text }]}
//                                                 numberOfLines={1}
//                                                 ellipsizeMode="tail"
//                                             >
//                                                 {val}
//                                             </Text>
//                                         ))}
//                                     </View>
//                                 ))}
//                             </ScrollView>
//                         </View>
//                     </ScrollView>
//                     <TouchableOpacity
//                         onPress={handleGenerateTickets}
//                         disabled={loading}
//                         style={[
//                             styles.generateBtn,
//                             { backgroundColor: colors.button, opacity: loading ? 0.7 : 1 }
//                         ]}
//                     >
//                         {loading
//                             ? <ActivityIndicator color={colors.buttonText} size="small" />
//                             : <Text style={{ color: colors.buttonText, fontWeight: 'bold' }}>Generate Tickets</Text>
//                         }
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {/* Snackbar/Toast */}
//             {snackbar.visible && (
//                 <View style={[
//                     styles.snackbar,
//                     {
//                         backgroundColor: snackbar.severity === "success"
//                             ? colors.button
//                             : snackbar.severity === "error"
//                                 ? colors.cancelButton
//                                 : colors.dropdownBackground
//                     }
//                 ]}>
//                     <Text style={{ color: colors.buttonText }}>{snackbar.message}</Text>
//                 </View>
//             )}
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         padding: 16,
//         flexGrow: 1
//     },
//     noFormBox: {
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 32,
//     },
//     noFormTitle: {
//         fontWeight: "bold",
//         fontSize: 20,
//         marginBottom: 10,
//     },
//     noFormText: {
//         fontSize: 14,
//         textAlign: "center",
//         maxWidth: 300,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 8,
//     },
//     description: {
//         marginBottom: 4,
//         fontSize: 15,
//     },
//     warning: {
//         marginBottom: 16,
//         fontSize: 13,
//         fontWeight: 'bold'
//     },
//     card: {
//         borderRadius: 8,
//         marginBottom: 16,
//         elevation: 2,
//         padding: 14,
//     },
//     note: {
//         marginBottom: 8,
//         fontSize: 14,
//     },
//     downloadButton: {
//         padding: 10,
//         borderRadius: 4,
//         marginBottom: 8,
//         alignSelf: 'flex-start',
//     },
//     downloadText: {
//         textAlign: 'center',
//         fontWeight: 'bold'
//     },
//     uploadBox: {
//         borderWidth: 2,
//         borderStyle: 'dashed',
//         borderRadius: 8,
//         padding: 24,
//         alignItems: 'center',
//         marginTop: 12,
//     },
//     uploadIcon: {
//         fontSize: 32,
//         marginBottom: 8,
//     },
//     uploadText: {
//         textDecorationLine: 'underline',
//         marginBottom: 4,
//         fontSize: 15,
//         fontWeight: 'bold'
//     },
//     uploadNote: {
//         fontSize: 12,
//     },
//     previewBox: {
//         marginTop: 18,
//         paddingBottom: 16
//     },
//     previewTitle: {
//         fontSize: 18,
//         marginBottom: 10,
//         fontWeight: 'bold'
//     },
//     tablePreview: {
//         borderRadius: 6,
//         minHeight: 60,
//         padding: 10,
//         marginBottom: 14,
//         maxWidth: '100%',
//     },
//     previewTableRow: {
//         flexDirection: 'row',
//         minHeight: 32,
//         alignItems: 'center'
//     },
//     previewTableHeader: {
//         fontWeight: 'bold',
//         fontSize: 13
//     },
//     previewTableCell: {
//         fontSize: 13,
//         paddingHorizontal: 12,
//         paddingVertical: 4,
//         minWidth: 80,
//         maxWidth: 120,
//     },
//     generateBtn: {
//         marginTop: 10,
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 46
//     },
//     snackbar: {
//         position: "absolute",
//         bottom: 28,
//         left: 20,
//         right: 20,
//         borderRadius: 6,
//         padding: 12,
//         alignItems: 'center',
//         elevation: 3,
//         zIndex: 100,
//     },
// });
