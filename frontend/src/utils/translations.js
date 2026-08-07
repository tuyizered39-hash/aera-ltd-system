/**
 * Centralized translations file
 * Contains all translations for the AERA LTD system
 * Supports: English (en), French (fr), Kinyarwanda (rw)
 */

export const translations = {
  en: {
    // ============================================
    // COMMON
    // ============================================
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
    'common.rate': 'Rate',
    'common.percentage': 'Percentage',
    'common.from': 'From',
    'common.to': 'To',
    'common.range': 'Range',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.reset': 'Reset',
    'common.refresh': 'Refresh',
    'common.more': 'More',
    'common.less': 'Less',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.show': 'Show',
    'common.hide': 'Hide',
    'common.upload': 'Upload',
    'common.export': 'Export',
    'common.import': 'Import',

    // ============================================
    // AUTH
    // ============================================
    'auth.login': 'Login',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.invalid_credentials': 'Invalid username or password',
    'auth.login_success': 'Login successful',
    'auth.logout': 'Logout',
    'auth.unauthorized': 'Unauthorized access',
    'auth.session_expired': 'Session expired. Please login again',
    'auth.register': 'Register',
    'auth.confirm_password': 'Confirm Password',
    'auth.password_mismatch': 'Passwords do not match',

    // ============================================
    // SERVICES
    // ============================================
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
    'services.item_name': 'Item Name',
    'services.quantity': 'Quantity',
    'services.add_item': 'Add Item',
    'services.remove_item': 'Remove Item',
    'services.items': 'Items',
    'services.delivery_address': 'Delivery Address',
    'services.expected_return': 'Expected Return',
    'services.actual_return': 'Actual Return',
    'services.return_status': 'Return Status',
    'services.pending': 'Pending',
    'services.returned': 'Returned',
    'services.overdue': 'Overdue',
    'services.mode_of_payment': 'Mode of Payment',
    'services.cash': 'Cash',
    'services.mtn': 'MTN',
    'services.bank': 'Bank',

    // ============================================
    // DASHBOARD
    // ============================================
    'dashboard.title': 'Dashboard',
    'dashboard.today_services': "Today's Services",
    'dashboard.monthly_income': 'Monthly Income',
    'dashboard.active_clients': 'Active Clients',
    'dashboard.pending_tasks': 'Pending Tasks',
    'dashboard.total_services': 'Total Services',
    'dashboard.recent_services': 'Recent Services',
    'dashboard.worker_present': '{name} is present today',
    'dashboard.weekly_stats': 'Weekly Statistics',
    'dashboard.monthly_stats': 'Monthly Statistics',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.overview': 'Overview',
    'dashboard.revenue': 'Revenue',
    'dashboard.services_by_type': 'Services by Type',

    // ============================================
    // NOTIFICATIONS
    // ============================================
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.unread': 'Unread',
    'notifications.read': 'Read',
    'notifications.no_notifications': 'No notifications',
    'notifications.attendance': 'Attendance',
    'notifications.report': 'Report',
    'notifications.service': 'Service',
    'notifications.delivery': 'Delivery',
    'notifications.system': 'System',
    'notifications.new_report': 'New report available',
    'notifications.delivery_overdue': 'Delivery overdue for {client}',
    'notifications.worker_present': '{name} is present today',

    // ============================================
    // WORKERS
    // ============================================
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
    'workers.manage': 'Manage Workers',
    'workers.worker_list': 'Worker List',
    'workers.attendance_tracking': 'Attendance Tracking',
    'workers.no_workers': 'No workers found',
    'workers.worker_created': 'Worker created successfully',
    'workers.worker_updated': 'Worker updated successfully',
    'workers.worker_deleted': 'Worker deleted successfully',
    'workers.delete_confirm': 'Are you sure you want to delete this worker?',
    'workers.active_workers': 'Active Workers',
    'workers.inactive_workers': 'Inactive Workers',
    'workers.today_attendance': "Today's Attendance",

    // ============================================
    // REPORTS
    // ============================================
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
    'reports.no_reports': 'No reports found',
    'reports.report_generated': 'Report generated successfully',
    'reports.report_deleted': 'Report deleted successfully',
    'reports.income': 'Income',
    'reports.expenses': 'Expenses',
    'reports.profit': 'Profit',
    'reports.summary': 'Summary',
    'reports.details': 'Details',
    'reports.period': 'Period',
    'reports.service_count': 'Service Count',

    // ============================================
    // SETTINGS
    // ============================================
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.profile_picture': 'Profile Picture',
    'settings.change_password': 'Change Password',
    'settings.current_password': 'Current Password',
    'settings.new_password': 'New Password',
    'settings.confirm_new_password': 'Confirm New Password',
    'settings.password_changed': 'Password changed successfully',
    'settings.profile_updated': 'Profile updated successfully',
    'settings.language': 'Language',
    'settings.notifications_preferences': 'Notifications Preferences',
    'settings.theme': 'Theme',
    'settings.dark_mode': 'Dark Mode',
    'settings.light_mode': 'Light Mode',

    // ============================================
    // ERRORS
    // ============================================
    'errors.server_error': 'Server error occurred',
    'errors.not_found': 'Resource not found',
    'errors.unauthorized': 'Unauthorized access',
    'errors.validation': 'Validation error',
    'errors.invalid_credentials': 'Invalid username or password',
    'errors.network': 'Network error. Please check your connection',
    'errors.session_expired': 'Session expired. Please login again',
    'errors.forbidden': 'You do not have permission to perform this action',
    'errors.bad_request': 'Invalid request',
    'errors.conflict': 'Resource already exists',
    'errors.too_many_requests': 'Too many requests. Please try again later',
    'errors.maintenance': 'System is under maintenance. Please try again later',
    'errors.file_too_large': 'File is too large. Maximum size is {size}',
    'errors.invalid_file_type': 'Invalid file type. Allowed types: {types}',
    'errors.upload_failed': 'File upload failed',

    // ============================================
    // PAGINATION
    // ============================================
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
    // Common
    'common.welcome': 'Bienvenue',
    'common.loading': 'Chargement...',
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
    'common.menu': 'Menu',
    'common.dashboard': 'Tableau de bord',
    'common.services': 'Services',
    'common.reports': 'Rapports',
    'common.workers': 'Employés',
    'common.settings': 'Paramètres',
    'common.notifications': 'Notifications',
    'common.logout': 'Déconnexion',
    'common.login': 'Connexion',
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
    'common.attendance': 'Présence',
    'common.present': 'Présent',
    'common.absent': 'Absent',
    'common.late': 'En retard',
    'common.excused': 'Excusé',
    'common.total': 'Total',
    'common.select': 'Sélectionner',
    'common.optional': 'Optionnel',
    'common.required': 'Obligatoire',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.unknown': 'Inconnu',
    'common.rate': 'Taux',
    'common.percentage': 'Pourcentage',
    'common.from': 'De',
    'common.to': 'À',
    'common.range': 'Plage',
    'common.apply': 'Appliquer',
    'common.clear': 'Effacer',
    'common.reset': 'Réinitialiser',
    'common.refresh': 'Rafraîchir',

    // Auth
    'auth.login': 'Connexion',
    'auth.username': "Nom d'utilisateur",
    'auth.password': 'Mot de passe',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.invalid_credentials': "Nom d'utilisateur ou mot de passe invalide",
    'auth.login_success': 'Connexion réussie',
    'auth.logout': 'Déconnexion',
    'auth.unauthorized': 'Accès non autorisé',
    'auth.session_expired': 'Session expirée. Veuillez vous reconnecter',

    // Services
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
    'services.district': 'District',
    'services.amount': 'Montant',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.today_services': 'Services du jour',
    'dashboard.monthly_income': 'Revenu mensuel',
    'dashboard.active_clients': 'Clients actifs',
    'dashboard.pending_tasks': 'Tâches en attente',
    'dashboard.recent_services': 'Services récents',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Tout marquer comme lu',
    'notifications.unread': 'Non lu',
    'notifications.read': 'Lu',
    'notifications.no_notifications': 'Aucune notification',

    // Workers
    'workers.title': 'Gestion des employés',
    'workers.add_worker': 'Ajouter un employé',
    'workers.name': 'Nom',
    'workers.username': "Nom d'utilisateur",
    'workers.email': 'Email',
    'workers.phone': 'Téléphone',
    'workers.role': 'Rôle',
    'workers.status': 'Statut',
    'workers.present_today': 'Présent aujourd\'hui',
    'workers.absent_today': 'Absent aujourd\'hui',

    // Reports
    'reports.title': 'Rapports',
    'reports.generate': 'Générer un rapport',
    'reports.download_pdf': 'Télécharger PDF',
    'reports.download_excel': 'Télécharger Excel',
    'reports.monthly': 'Rapport mensuel',
    'reports.daily': 'Rapport quotidien',
    'reports.total_amount': 'Montant total',
    'reports.total_paid': 'Total payé',
    'reports.total_unpaid': 'Total impayé',

    // Settings
    'settings.title': 'Paramètres',
    'settings.profile': 'Profil',
    'settings.change_password': 'Changer le mot de passe',
    'settings.current_password': 'Mot de passe actuel',
    'settings.new_password': 'Nouveau mot de passe',
    'settings.confirm_new_password': 'Confirmer le nouveau mot de passe',
    'settings.password_changed': 'Mot de passe changé avec succès',
    'settings.profile_updated': 'Profil mis à jour avec succès',

    // Errors
    'errors.server_error': 'Erreur serveur',
    'errors.not_found': 'Ressource non trouvée',
    'errors.unauthorized': 'Accès non autorisé',
    'errors.validation': 'Erreur de validation',
    'errors.invalid_credentials': "Nom d'utilisateur ou mot de passe invalide",
    'errors.network': 'Erreur réseau. Vérifiez votre connexion',
    'errors.session_expired': 'Session expirée. Veuillez vous reconnecter',
    'errors.forbidden': "Vous n'avez pas la permission d'effectuer cette action",

    // Pagination
    'pagination.prev': 'Précédent',
    'pagination.next': 'Suivant',
    'pagination.first': 'Premier',
    'pagination.last': 'Dernier',
    'pagination.showing': 'Affichage de {start} à {end} sur {total}',
    'pagination.rows_per_page': 'Lignes par page',
  },

  // ============================================
  // KINYARWANDA TRANSLATIONS
  // ============================================
  rw: {
    // Common
    'common.welcome': 'Murakaza Neza',
    'common.loading': 'Birimo...',
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
    'common.menu': 'Urufunguzo',
    'common.dashboard': 'Urubuga rw\'imbere',
    'common.services': 'Serivisi',
    'common.reports': 'Raporo',
    'common.workers': 'Abakozi',
    'common.settings': 'Ibyigenewe',
    'common.notifications': 'Imenyesha',
    'common.logout': 'Sohoka',
    'common.login': 'Kwinjira',
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
    'common.error': 'Ihabu',
    'common.ongoing': 'Iri gukora',
    'common.completed': 'Byarangiye',
    'common.cancelled': 'Byahagaritswe',
    'common.no_data': 'Nta makuru aboneka',
    'common.filter': 'Tandukanya',
    'common.all': 'Byose',
    'common.active': 'Igikora',
    'common.inactive': 'Ntigikora',
    'common.print': 'Capa',
    'common.download': 'Kurura',
    'common.no_results': 'Nta byavuye',
    'common.attendance': 'Itabaza',
    'common.present': 'Ahari',
    'common.absent': 'Ntariho',
    'common.late': 'Atinze',
    'common.excused': 'Yemerewe',
    'common.total': 'Byose hamwe',
    'common.select': 'Hitamo',
    'common.optional': 'Ubashije',
    'common.required': 'Birakenewe',
    'common.confirm': 'Emeza',
    'common.yes': 'Yego',
    'common.no': 'Oya',
    'common.ok': 'Nibyo',
    'common.unknown': 'Kitazwi',
    'common.rate': 'Igipimo',
    'common.percentage': 'Ijanisha',
    'common.from': 'Kuva',
    'common.to': 'Kugeza',
    'common.range': 'Urwego',
    'common.apply': 'Koresha',
    'common.clear': 'Hanagura',
    'common.reset': 'Subiza',
    'common.refresh': 'Vugurura',

    // Auth
    'auth.login': 'Kwinjira',
    'auth.username': 'Izina Ukoresha',
    'auth.password': 'Ijambo ry\'ibanga',
    'auth.forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'auth.invalid_credentials': 'Amakuru si yo',
    'auth.login_success': 'Winjiye neza',
    'auth.logout': 'Sohoka',
    'auth.unauthorized': 'Nta ruhushya ufite',
    'auth.session_expired': 'Igihe cyawe kirangiye. Kwinjira bundi bushya',

    // Services
    'services.it_maintenance': 'Gukora no kuvura IT',
    'services.electrical_installation': 'Gushyira amashanyarazi',
    'services.construction': 'Imyubakire',
    'services.generator_repair': 'Gukora jenareta',
    'services.office_stationary': 'Ibikoresho by\'ibiro',
    'services.decoration_sound': 'Gutaka no kuvuza amajwi',
    'services.new_service': 'Serivisi nshya',
    'services.client_name': 'Izina ry\'umukiriya',
    'services.payment_status': 'Imiterere y\'ishyuri',
    'services.payment_mode': 'Uburyo bwo kwishyura',
    'services.district': 'Akarere',
    'services.amount': 'Amafaranga',

    // Dashboard
    'dashboard.title': 'Urubuga rw\'imbere',
    'dashboard.today_services': 'Serivisi za none',
    'dashboard.monthly_income': 'Amafaranga yakozwe mu kwezi',
    'dashboard.active_clients': 'Abakiriya bakora',
    'dashboard.pending_tasks': 'Ibikorwa biri gukurikira',
    'dashboard.recent_services': 'Serivisi zishize',

    // Notifications
    'notifications.title': 'Imenyesha',
    'notifications.mark_all_read': 'Erekana byose nk\'ibyasomywe',
    'notifications.unread': 'Ibitarasomwa',
    'notifications.read': 'Byasomwe',
    'notifications.no_notifications': 'Nta menyesha',

    // Workers
    'workers.title': 'Gucunga abakozi',
    'workers.add_worker': 'Ongera umukozi',
    'workers.name': 'Izina',
    'workers.username': 'Izina Ukoresha',
    'workers.email': 'E-mail',
    'workers.phone': 'Telefone',
    'workers.role': 'Uruhushya',
    'workers.status': 'Imiterere',
    'workers.present_today': 'Ahari uyu munsi',
    'workers.absent_today': 'Ntariho uyu munsi',

    // Reports
    'reports.title': 'Raporo',
    'reports.generate': 'Kora raporo',
    'reports.download_pdf': 'Kurura PDF',
    'reports.download_excel': 'Kurura Excel',
    'reports.monthly': 'Raporo y\'ukwezi',
    'reports.daily': 'Raporo y\'umunsi',
    'reports.total_amount': 'Amafaranga yose',
    'reports.total_paid': 'Byishyuwe byose',
    'reports.total_unpaid': 'Bitishyuwe byose',

    // Settings
    'settings.title': 'Ibyigenewe',
    'settings.profile': 'Umwirondoro',
    'settings.change_password': 'Hindura ijambo ry\'ibanga',
    'settings.current_password': 'Ijambo ry\'ibanga ririho',
    'settings.new_password': 'Ijambo ry\'ibanga rishya',
    'settings.confirm_new_password': 'Emeza ijambo ry\'ibanga rishya',
    'settings.password_changed': 'Ijambo ry\'ibanga ryahinduwe neza',
    'settings.profile_updated': 'Umwirondoro wavuguruwe neza',

    // Errors
    'errors.server_error': 'Hari ikibazo kuri seriveri',
    'errors.not_found': 'Ibyashakishijwe ntibiboneka',
    'errors.unauthorized': 'Nta ruhushya ufite',
    'errors.validation': 'Amakuru si yo',
    'errors.invalid_credentials': 'Izina cyangwa ijambo ry\'ibanga si byo',
    'errors.network': 'Ikibazo mu byuma. Reba ko isiganwa rikora',
    'errors.session_expired': 'Igihe cyawe kirangiye. Kwinjira bundi bushya',
    'errors.forbidden': 'Nta ruhushya ufite yo gukora iki gikorwa',

    // Pagination
    'pagination.prev': 'Ibibanzwe',
    'pagination.next': 'Ibikurikira',
    'pagination.first': 'Ibyambere',
    'pagination.last': 'Ibyanyuma',
    'pagination.showing': 'Kwerekana {start} kugeza {end} kuri {total}',
    'pagination.rows_per_page': 'Imirongo ku rupapuro',
  },
};

/**
 * Get translation by key
 * @param {string} key - Translation key
 * @param {string} locale - Language code (en, fr, rw)
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated text
 */
export const getTranslation = (key, locale = 'en', params = {}) => {
  let value = translations[locale]?.[key];
  
  if (!value) {
    // Fallback to English
    value = translations['en'][key] || key;
  }

  // Replace parameters like {name}
  if (typeof value === 'string') {
    Object.keys(params).forEach(param => {
      value = value.replace(`{${param}}`, params[param]);
    });
  }

  return value;
};

/**
 * Get all translations for a specific locale
 * @param {string} locale - Language code (en, fr, rw)
 * @returns {object} All translations for the locale
 */
export const getTranslations = (locale = 'en') => {
  return translations[locale] || translations['en'];
};

export default translations;