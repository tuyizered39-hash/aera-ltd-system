import React, { createContext, useState, useContext, useEffect } from 'react';

// ============================================
// COMPLETE TRANSLATIONS
// ============================================
const translations = {
  en: {
    // Common
    'common.welcome': 'Welcome',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.amount': 'Amount',
    'common.client': 'Client',
    'common.location': 'Location',
    'common.payment': 'Payment',
    'common.actions': 'Actions',
    'common.menu': 'Menu',
    'common.dashboard': 'Dashboard',
    'common.services': 'Services',
    'common.reports': 'Reports',
    'common.workers': 'Workers',
    'common.settings': 'Settings',
    'common.notifications': 'Notifications',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.username': 'Username',
    'common.password': 'Password',
    'common.forgot_password': 'Forgot Password?',
    'common.paid': 'Paid',
    'common.unpaid': 'Unpaid',
    'common.partial': 'Partial',
    'common.new': 'New',
    'common.view': 'View',
    'common.back': 'Back',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.ongoing': 'Ongoing',
    'common.completed': 'Completed',
    'common.cancelled': 'Cancelled',
    'common.no_data': 'No data found',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.print': 'Print',
    'common.download': 'Download',
    'common.no_results': 'No results found',
    'common.attendance': 'Attendance',
    'common.present': 'Present',
    'common.absent': 'Absent',
    'common.late': 'Late',
    'common.excused': 'Excused',
    'common.total': 'Total',
    'common.select': 'Select',
    'common.optional': 'Optional',
    'common.required': 'Required',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.unknown': 'Unknown',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.reset': 'Reset',
    'common.refresh': 'Refresh',

    // Auth
    'auth.login': 'Login',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.invalid_credentials': 'Invalid username or password',
    'auth.login_success': 'Login successful',
    'auth.logout': 'Logout',
    'auth.unauthorized': 'Unauthorized access',

    // Services
    'services.it_maintenance': 'IT Maintenance & Repair',
    'services.electrical_installation': 'Electrical Installation',
    'services.construction': 'Construction',
    'services.generator_repair': 'Generator Repair',
    'services.office_stationary': 'Office Stationary',
    'services.decoration_sound': 'Decoration & Sound System',
    'services.new_service': 'New Service',
    'services.service_details': 'Service Details',
    'services.client_name': 'Client Name',
    'services.client_phone': 'Client Phone',
    'services.client_email': 'Client Email',
    'services.start_date': 'Start Date',
    'services.end_date': 'End Date',
    'services.payment_status': 'Payment Status',
    'services.payment_mode': 'Payment Mode',
    'services.tent_quantity': 'Tent Quantity',
    'services.decoration_items': 'Decoration Items',
    'services.location': 'Location',
    'services.district': 'District',
    'services.amount': 'Amount',
    'services.amount_paid': 'Amount Paid',
    'services.description': 'Description',
    'services.notes': 'Notes',
    'services.delivery_tracking': 'Delivery Tracking',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.today_services': "Today's Services",
    'dashboard.monthly_income': 'Monthly Income',
    'dashboard.active_clients': 'Active Clients',
    'dashboard.pending_tasks': 'Pending Tasks',
    'dashboard.total_services': 'Total Services',
    'dashboard.recent_services': 'Recent Services',
    'dashboard.worker_present': '{name} is present today',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.unread': 'Unread',
    'notifications.read': 'Read',
    'notifications.no_notifications': 'No notifications',

    // Workers
    'workers.title': 'Workers Management',
    'workers.add_worker': 'Add Worker',
    'workers.name': 'Worker Name',
    'workers.username': 'Username',
    'workers.email': 'Email',
    'workers.phone': 'Phone',
    'workers.role': 'Role',
    'workers.status': 'Status',
    'workers.present_today': 'Present Today',
    'workers.absent_today': 'Absent Today',
    'workers.attendance': 'Attendance',

    // Reports
    'reports.title': 'Reports',
    'reports.generate': 'Generate Report',
    'reports.download_pdf': 'Download PDF',
    'reports.download_excel': 'Download Excel',
    'reports.monthly': 'Monthly Report',
    'reports.daily': 'Daily Report',
    'reports.service_summary': 'Service Summary',
    'reports.total_amount': 'Total Amount',
    'reports.total_paid': 'Total Paid',
    'reports.total_unpaid': 'Total Unpaid',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.change_password': 'Change Password',
    'settings.current_password': 'Current Password',
    'settings.new_password': 'New Password',
    'settings.confirm_new_password': 'Confirm New Password',

    // Errors
    'errors.server_error': 'Server error occurred',
    'errors.not_found': 'Resource not found',
    'errors.unauthorized': 'Unauthorized access',
    'errors.validation': 'Validation error',
    'errors.invalid_credentials': 'Invalid username or password',
    'errors.network': 'Network error. Please check your connection',

    // Pagination
    'pagination.prev': 'Previous',
    'pagination.next': 'Next',
    'pagination.first': 'First',
    'pagination.last': 'Last',
    'pagination.showing': 'Showing {start} to {end} of {total}',
    'pagination.rows_per_page': 'Rows per page',
  },

  // ============================================
  // FRENCH TRANSLATIONS
  // ============================================
  fr: {
    'common.welcome': 'Bienvenue',
    'common.dashboard': 'Tableau de bord',
    'common.menu': 'Menu',
    'common.login': 'Connexion',
    'common.logout': 'Déconnexion',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.amount': 'Montant',
    'common.client': 'Client',
    'common.location': 'Emplacement',
    'common.payment': 'Paiement',
    'common.actions': 'Actions',
    'common.services': 'Services',
    'common.reports': 'Rapports',
    'common.workers': 'Employés',
    'common.settings': 'Paramètres',
    'common.notifications': 'Notifications',
    'common.username': "Nom d'utilisateur",
    'common.password': 'Mot de passe',
    'common.forgot_password': 'Mot de passe oublié ?',
    'common.paid': 'Payé',
    'common.unpaid': 'Impayé',
    'common.partial': 'Partiel',
    'common.new': 'Nouveau',
    'common.view': 'Voir',
    'common.back': 'Retour',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'common.ongoing': 'En cours',
    'common.completed': 'Terminé',
    'common.cancelled': 'Annulé',
    'common.no_data': 'Aucune donnée trouvée',
    'common.filter': 'Filtre',
    'common.all': 'Tous',
    'common.active': 'Actif',
    'common.inactive': 'Inactif',
    'common.print': 'Imprimer',
    'common.download': 'Télécharger',
    'common.no_results': 'Aucun résultat trouvé',

    'auth.login': 'Connexion',
    'auth.username': "Nom d'utilisateur",
    'auth.password': 'Mot de passe',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.invalid_credentials': "Nom d'utilisateur ou mot de passe invalide",

    'services.it_maintenance': 'Maintenance et réparation informatique',
    'services.electrical_installation': 'Installation électrique',
    'services.construction': 'Construction',
    'services.generator_repair': 'Réparation de générateur',
    'services.office_stationary': 'Fournitures de bureau',
    'services.decoration_sound': 'Décoration et sonorisation',
    'services.new_service': 'Nouveau service',
    'services.client_name': 'Nom du client',
    'services.payment_status': 'Statut de paiement',
    'services.payment_mode': 'Mode de paiement',

    'dashboard.title': 'Tableau de bord',
    'dashboard.today_services': 'Services du jour',
    'dashboard.monthly_income': 'Revenu mensuel',
    'dashboard.active_clients': 'Clients actifs',
    'dashboard.pending_tasks': 'Tâches en attente',

    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Tout marquer comme lu',
    'notifications.unread': 'Non lu',
    'notifications.read': 'Lu',
    'notifications.no_notifications': 'Aucune notification',

    'workers.title': 'Gestion des employés',
    'workers.add_worker': 'Ajouter un employé',
    'workers.name': 'Nom',
    'workers.email': 'Email',
    'workers.phone': 'Téléphone',
    'workers.role': 'Rôle',
    'workers.status': 'Statut',
    'workers.present_today': 'Présent aujourd\'hui',
    'workers.absent_today': 'Absent aujourd\'hui',

    'reports.title': 'Rapports',
    'reports.generate': 'Générer un rapport',
    'reports.download_pdf': 'Télécharger PDF',
    'reports.download_excel': 'Télécharger Excel',
    'reports.monthly': 'Rapport mensuel',
    'reports.daily': 'Rapport quotidien',
    'reports.total_amount': 'Montant total',
    'reports.total_paid': 'Total payé',
    'reports.total_unpaid': 'Total impayé',

    'settings.title': 'Paramètres',
    'settings.profile': 'Profil',
    'settings.change_password': 'Changer le mot de passe',
    'settings.current_password': 'Mot de passe actuel',
    'settings.new_password': 'Nouveau mot de passe',
    'settings.confirm_new_password': 'Confirmer le nouveau mot de passe',

    'errors.server_error': 'Erreur serveur',
    'errors.not_found': 'Ressource non trouvée',
    'errors.unauthorized': 'Accès non autorisé',
    'errors.validation': 'Erreur de validation',
    'errors.invalid_credentials': "Nom d'utilisateur ou mot de passe invalide",
    'errors.network': 'Erreur réseau. Vérifiez votre connexion',
  },

  // ============================================
  // KINYARWANDA TRANSLATIONS
  // ============================================
  rw: {
    'common.welcome': 'Murakaza Neza',
    'common.dashboard': 'Urubuga rw\'imbere',
    'common.menu': 'Urufunguzo',
    'common.login': 'Kwinjira',
    'common.logout': 'Sohoka',
    'common.save': 'Bika',
    'common.cancel': 'Hagarika',
    'common.delete': 'Siba',
    'common.edit': 'Hindura',
    'common.search': 'Shakisha',
    'common.status': 'Imiterere',
    'common.date': 'Itariki',
    'common.amount': 'Amafaranga',
    'common.client': 'Umukiriya',
    'common.location': 'Aho',
    'common.payment': 'Kwishyura',
    'common.actions': 'Ibikorwa',
    'common.services': 'Serivisi',
    'common.reports': 'Raporo',
    'common.workers': 'Abakozi',
    'common.settings': 'Ibyigenewe',
    'common.notifications': 'Imamenyesha',
    'common.username': 'Izina Ukoresha',
    'common.password': 'Ijambo ry\'ibanga',
    'common.forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'common.paid': 'Byishyuwe',
    'common.unpaid': 'Ntibyishyuwe',
    'common.partial': 'Igice',
    'common.new': 'Gishya',
    'common.view': 'Reba',
    'common.back': 'Subira',
    'common.submit': 'Ohereza',
    'common.close': 'Funga',
    'common.success': 'Byakunze',
    'common.error': 'Ikosa',
    'common.ongoing': 'Iricyakorwaho',
    'common.completed': 'Byarangiye',
    'common.cancelled': 'Byahagaritswe',
    'common.no_data': 'Nta makuru aboneka',
    'common.filter': 'Tandukanya',
    'common.all': 'Byose',
    'common.active': 'Irakora',
    'common.inactive': 'Ntikora',
    'common.print': 'Printinga',
    'common.download': 'Downloadinga',
    'common.no_results': 'Nta byavuye',

    'auth.login': 'Kwinjira',
    'auth.username': 'Izina Ukoresha',
    'auth.password': 'Ijambo banga',
    'auth.forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'auth.invalid_credentials': 'Amakuru si yo',

    'services.it_maintenance': 'Gukora no kuvura IT',
    'services.electrical_installation': 'Gushyira amashanyarazi',
    'services.construction': 'Imyubakire',
    'services.generator_repair': 'Gukora jenareta',
    'services.office_stationary': 'Ibikoresho by\'ibiro',
    'services.decoration_sound': 'Gutaka no kuvuza amajwi',
    'services.new_service': 'Serivisi nshya',
    'services.client_name': 'Izina ry\'umukiriya',
    'services.payment_status': 'Yishyuye cyangwa Oya',
    'services.payment_mode': 'Uburyo bwo kwishyura',

    'dashboard.title': 'Ahabanza',
    'dashboard.today_services': 'Serivisi za none',
    'dashboard.monthly_income': 'Amafaranga yanjiye mu kwezi',
    'dashboard.active_clients': 'Abakiriya',
    'dashboard.pending_tasks': 'Ibikorwa bikirigukorwaho',

    'notifications.title': 'Amamenyesha',
    'notifications.mark_all_read': 'Erekana byose nk\'ibyasomywe',
    'notifications.unread': 'Ibitarasomwa',
    'notifications.read': 'Byasomwe',
    'notifications.no_notifications': 'Nta mamenyesha',

    'workers.title': 'Gucunga abakozi',
    'workers.add_worker': 'Ongeraho umukozi mushya',
    'workers.name': 'Izina',
    'workers.email': 'Imeri',
    'workers.phone': 'Telefone',
    'workers.role': 'Uruhushya',
    'workers.status': 'Imiterere',
    'workers.present_today': 'Arahari uyu munsi',
    'workers.absent_today': 'Ntariho uyu munsi',

    'reports.title': 'Raporo',
    'reports.generate': 'Kora raporo',
    'reports.download_pdf': 'Kurura PDF',
    'reports.download_excel': 'Kurura Excel',
    'reports.monthly': 'Raporo y\'ukwezi',
    'reports.daily': 'Raporo y\'umunsi',
    'reports.total_amount': 'Amafaranga yose',
    'reports.total_paid': 'IByishyuwe byose',
    'reports.total_unpaid': 'IBitishyuwe byose',
    'reports.total_partial': 'IByishyuwe igice',

    'settings.title': 'Ibyigenewe',
    'settings.profile': 'Umwirondoro',
    'settings.change_password': 'Hindura ijambo ry\'ibanga',
    'settings.current_password': 'Ijambo ry\'ibanga ririho',
    'settings.new_password': 'Ijambo ry\'ibanga rishya',
    'settings.confirm_new_password': 'Emeza ijambo ry\'ibanga rishya',

    'errors.server_error': 'Hari ikibazo kuri seriveri',
    'errors.not_found': 'Ibyashakishijwe ntibiboneka',
    'errors.unauthorized': 'Nta ruhushya ufite',
    'errors.validation': 'Amakuru si yo',
    'errors.invalid_credentials': 'Izina cyangwa ijambo ry\'ibanga si byo',
    'errors.network': 'Ikibazo ',
  }
};

// ============================================
// LANGUAGE CONTEXT
// ============================================
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // ✅ Force English for testing

  // ✅ Simplified t() function - NO nested logic
  const t = (key) => {
    // Try to get translation from current language
    const result = translations[language]?.[key];
    
    // If not found, try English
    if (!result) {
      const englishResult = translations.en[key];
      if (englishResult) {
        return englishResult;
      }
    }
    
    // If still not found, return the key
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;