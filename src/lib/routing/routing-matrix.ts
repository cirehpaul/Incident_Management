
export interface RoutingMatrixEntry {
  category: string;
  subCategory: string;
  item: string;
  definition?: string;
  autoAssignedGroup: string;
  targetReportTeam: string;
}

export const GROUP_TO_REPORT_TEAM: Record<string, string> = {
  'ECS HRAD Group': 'ECS ADMIN',
  'ECS HRAD': 'ECS ADMIN',
  'ECS ISS Binondo': 'ECS ISS',
  'ECS ISS': 'ECS ISS',
  'ECS PSD Group': 'ECS PSD',
  'ECS PSD': 'ECS PSD',
  'ECS ISMS Support Group': 'ECS ISMS Support',
  'ECS ISMS Support': 'ECS ISMS Support',
  'ECS SDS': 'ECS SDS',
  'ECS HR': 'ECS HR',
  'ECS ADMIN': 'ECS ADMIN',
};

export const ROUTING_MATRIX: RoutingMatrixEntry[] = [
  //  Facility & Environment Issues 
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Short/Open Circuit',
    definition: 'Any issues affecting the physical infrastructure, such as power outages, heating/cooling problems, or facility damage.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Busted/Flickering Light',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Defective/Faulty Outlet',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Leaking Water',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Defective Building Fixtures',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Defective Aircon',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Defective Water Dispenser',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Malfunctioning Elevator',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Lack or No Water Supply',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Lack or No Electric Supply',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Defective Plumbing Fixtures',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Office Supply (Table,Chair,mobile)',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Facility Issue',
    item: 'Others',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Natural disasters (e.g., flooding, earthquakes)',
    definition: 'Environmental hazards such as spills, leaks, or unsafe working conditions in the facility.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Air Quality Issues',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Insufficient or excessive lighting',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Excessive noise from machinery, equipment, or external sources',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Uncomfortable or unhealthy temperature and humidity levels',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Improper handling of hazardous waste',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Inadequate waste disposal systems',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Facility & Environment Issues',
    subCategory: 'Environment Issue',
    item: 'Others',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },

  //External Vendor / Third Party Issues
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Quality of Goods/Services',
    item: 'Not Applicable',
    definition: 'If goods or services from a third party fail to meet the expected standards or specifications.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Timeliness & Delivery Issues',
    item: 'Not Applicable',
    definition: 'When a third party fails to deliver goods or services on time, impacting operations.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Reliability & Consistency Issues',
    item: 'Not Applicable',
    definition: 'Problems with the consistency or reliability of products/services provided by a third party.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Service Level Agreement (SLA) Issues',
    item: 'Not Applicable',
    definition: 'When third-party services fail to meet SLA requirements.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Lack of clear or timely communication',
    item: 'Not Applicable',
    definition: 'Communication issues from third parties that cause delays or misunderstandings.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Difficulty in escalating issues',
    item: 'Not Applicable',
    definition: 'If it’s difficult to raise or escalate issues with external vendors.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'External Vendor / Third Party Issues',
    subCategory: 'Price, Cost & Billing Issues',
    item: 'Not Applicable',
    definition: 'When there are discrepancies in pricing or billing from third-party providers.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },

  // Hardware Issues 
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Desktop',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Router/Switch',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Laptop',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'IP Phone/ Telephone',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Face Biometrics / ID Card Biometrics',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Server',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Firewall',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Printer',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Mouse',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Headset',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Scanner',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'CCTV',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Keyboard',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Power Cable/Adapter',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Others',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'POS Terminal',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'POS Peripherals/Accesories',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'SIM cards',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'Company Phone',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Hardware Issues',
    subCategory: 'Damage/Defective/Lost',
    item: 'POS Test Card',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },

  // Operational Issues 
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Late/Incorrect preparation of POS Terminal',
    definition: 'Problems with point-of-sale (POS) services or systems affecting transactions or sales.',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Late/Incorrect submission of report',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Card Transaction Issue',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Shipment issues',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Wrong/Overlooked SC creation',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Incorrect/Incomplete Validation',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Erroneous POS Programming/Replacement/Swapping',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Erroneous Profiling',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Mismanagement/ Misconfiguration of System',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Erroneous POS Installation',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },
  {
    category: 'Operational Issues',
    subCategory: 'POS Services Operation',
    item: 'Mishandling of POS Terminal & Peripherals',
    autoAssignedGroup: 'ECS PSD Group',
    targetReportTeam: 'ECS PSD',
  },

  // Safety & Security Issues 
  {
    category: 'Safety & Security Issues',
    subCategory: 'Physical Hazards',
    item: 'Trip hazards, slippery floors.',
    definition: 'When physical hazards such as unsafe working conditions, faulty equipment, or risk of injury are identified.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Physical Hazards',
    item: 'Unsafe equipment or machinery',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Security Breaches',
    item: 'Unauthorized Access',
    definition: 'Any incidents of unauthorized access or breaches that compromise system, data, or physical security.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Security Breaches',
    item: 'Theft',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Security Breaches',
    item: 'Virus/Malware/Threat Detection',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Security Breaches',
    item: 'Cyber Attack/Malicious Attempt',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Emergency Preparedness',
    item: 'Lack of clear evacuation plans',
    definition: 'Issues with emergency procedures or preparedness, such as failure to follow evacuation protocols or lack of readiness for emergencies.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Emergency Preparedness',
    item: 'Insufficient emergency exits or signage.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Emergency Preparedness',
    item: 'Inadequate first-aid provisions.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Data Breach',
    item: 'Accidental Disclosure',
    definition: 'Any incidents where sensitive data is accessed, exposed, or stolen.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Data Breach',
    item: 'Identity Theft',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Safety & Security Issues',
    subCategory: 'Data Breach',
    item: 'Phishing/Social Engineering',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },

  // Network Issues 
  {
    category: 'Network Issues',
    subCategory: 'Slow Connection',
    item: 'Not Applicable',
    definition: 'When network speed is below acceptable levels, affecting operations or productivity.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Network Issues',
    subCategory: 'Intermittent Connection',
    item: 'Not Applicable',
    definition: 'If the network connection is unstable, causing disruptions to work or services.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Network Issues',
    subCategory: 'Connected but can\'t browse',
    item: 'Not Applicable',
    definition: 'Network issues where devices are connected, but internet or internal resources are inaccessible.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Network Issues',
    subCategory: 'No Internet Connection',
    item: 'Not Applicable',
    definition: 'When there is no connection to the internet or network resources, impacting productivity.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Network Issues',
    subCategory: 'Time/Date not synchronized',
    item: 'Not Applicable',
    definition: 'When there are synchronization issues between devices or network time, causing potential errors.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Network Issues',
    subCategory: 'Network Downtime Alert',
    item: 'Not Applicable',
    definition: 'When there is an alert indicating network downtime or failure.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },

  //  Server Issues 
  {
    category: 'Server Issues',
    subCategory: 'TIme & Date not synchronized',
    item: 'Not Applicable',
    definition: 'When server time is incorrect or unsynchronized, causing potential data or system issues.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Server Issues',
    subCategory: 'Server Utilization Issues',
    item: 'Not Applicable',
    definition: 'Server performance problems due to high utilization or overload.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Server Issues',
    subCategory: 'Slow response',
    item: 'Not Applicable',
    definition: 'When servers take longer than expected to respond to requests or processes.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Server Issues',
    subCategory: 'Server Downtime Alert',
    item: 'Not Applicable',
    definition: 'Alerts indicating server downtime or failures that impact operations.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },

  // Software/Application Issues 
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Eyebeam',
    definition: 'Issues with any software or applications supported by the organization, affecting functionality or user experience.',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Foxmail',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Google  Workspace (G Suite)',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'MDM (Mobile Device Management)',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Microsoft Windows Operating System',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'OP Manager',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'PBX (IP Phone Application)',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Trend Micro AV',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'VPN (Forticlient)',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'ISS Supported Applications',
    item: 'Others',
    autoAssignedGroup: 'ECS ISS Binondo',
    targetReportTeam: 'ECS ISS',
  },

  // SDS Supported Applications
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'Service Portal',
    definition: 'Issues with software or applications related to SDS, impacting performance or accessibility.',
    autoAssignedGroup: 'ECS ISMS Support Group',
    targetReportTeam: 'ECS ISMS Support',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'Repair System',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'POS Profiling system',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'ECS ISMS',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'BDO ISMS',
    autoAssignedGroup: 'ECS ISMS Support Group',
    targetReportTeam: 'ECS ISMS Support',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'ECS PEARL',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'SDS Supported Applications',
    item: 'Not Applicable',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },

  // Other Software/Application Subcategories
  {
    category: 'Software/Application Issues',
    subCategory: 'Maxicare Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to Maxicare-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'MyHealth Systems/Applicatons',
    item: 'Not Applicable',
    definition: 'Problems related to MyHealth-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'MetroDental Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to MetroDental-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'MHSI Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to MHSI-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'EQB Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to EQB-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'Medilink Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to Medilink MHSI-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'Robinsons Systems/Applications',
    item: 'Not Applicable',
    definition: 'Problems related to Robinsons-supported systems or applications.',
    autoAssignedGroup: 'ECS SDS',
    targetReportTeam: 'ECS SDS',
  },

  // HRAD Supported Applications
  {
    category: 'Software/Application Issues',
    subCategory: 'HRAD (Supported Applications)',
    item: 'Dorado',
    definition: 'Problems related to HRAD-supported systems or applications.',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'HRAD (Supported Applications)',
    item: 'ESS',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
  {
    category: 'Software/Application Issues',
    subCategory: 'HRAD (Supported Applications)',
    item: 'ECS Website',
    autoAssignedGroup: 'ECS HRAD Group',
    targetReportTeam: 'ECS ADMIN',
  },
];


export function normalizeKey(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNotApplicableItem(item?: string | null): boolean {
  if (!item) return true;
  const norm = normalizeKey(item);
  return (
    norm === '' ||
    norm === 'not applicable' ||
    norm === 'na' ||
    norm === 'n a' ||
    norm === 'none'
  );
}

export function lookupRoutingMatrix(
  category?: string,
  subCategory?: string,
  item?: string
): RoutingMatrixEntry | null {
  const normCat = normalizeKey(category);
  const normSub = normalizeKey(subCategory);
  const normItem = normalizeKey(item);
  const itemIsNA = isNotApplicableItem(item);

  if (!normCat && !normSub && !normItem) return null;

  // 1) Precise Category + SubCategory + Item match
  if (normCat && normSub && !itemIsNA) {
    const directMatch = ROUTING_MATRIX.find((entry) => {
      const eCat = normalizeKey(entry.category);
      const eSub = normalizeKey(entry.subCategory);
      const eItem = normalizeKey(entry.item);

      const catMatches = normCat === eCat || normCat.includes(eCat) || eCat.includes(normCat);
      const subMatches = normSub === eSub || normSub.includes(eSub) || eSub.includes(normSub);
      const itemMatches = normItem === eItem || normItem.includes(eItem) || eItem.includes(normItem);

      return catMatches && subMatches && itemMatches;
    });

    if (directMatch) return directMatch;
  }

  // 2) Category + SubCategory match (when item is N/A or item didn't match a specific entry)
  if (normCat && normSub) {
    const subCatMatches = ROUTING_MATRIX.filter((entry) => {
      const eCat = normalizeKey(entry.category);
      const eSub = normalizeKey(entry.subCategory);
      const catMatches = normCat === eCat || normCat.includes(eCat) || eCat.includes(normCat);
      const subMatches = normSub === eSub || normSub.includes(eSub) || eSub.includes(normSub);
      return catMatches && subMatches;
    });

    if (subCatMatches.length > 0) {
      // If there's an entry explicitly with "Not Applicable", return that
      const naEntry = subCatMatches.find((e) => isNotApplicableItem(e.item));
      if (naEntry) return naEntry;

      // If all entries in this subcategory point to the same group, return the first one
      const allSameGroup = subCatMatches.every(
        (e) => e.targetReportTeam === subCatMatches[0].targetReportTeam
      );
      if (allSameGroup) return subCatMatches[0];

      // If SDS Supported Applications with unspecified item, default to ECS SDS
      if (normSub.includes('sds supported')) {
        const defaultSDS = subCatMatches.find((e) => e.targetReportTeam === 'ECS SDS');
        if (defaultSDS) return defaultSDS;
      }

      // If item was N/A, return first match
      if (itemIsNA) return subCatMatches[0];
    }
  }

  // 3) Match by SubCategory + Item if category wasn't provided or differed
  if (normSub && !itemIsNA) {
    const subItemMatch = ROUTING_MATRIX.find((entry) => {
      const eSub = normalizeKey(entry.category);
      const eItem = normalizeKey(entry.item);
      return (
        (normSub === eSub || normSub.includes(eSub) || eSub.includes(normSub)) &&
        (normItem === eItem || normItem.includes(eItem) || eItem.includes(normItem))
      );
    });
    if (subItemMatch) return subItemMatch;
  }

  // 4) Category-level fallback if the whole category consistently routes to one team
  if (normCat) {
    if (
      normCat.includes('facility') ||
      normCat.includes('environment') ||
      normCat.includes('external vendor') ||
      normCat.includes('third party')
    ) {
      return {
        category: category || 'Facility & Environment Issues',
        subCategory: subCategory || 'General',
        item: item || 'Not Applicable',
        autoAssignedGroup: 'ECS HRAD Group',
        targetReportTeam: 'ECS ADMIN',
      };
    }

    if (normCat.includes('network') || normCat.includes('server')) {
      return {
        category: category || 'Network Issues',
        subCategory: subCategory || 'General',
        item: item || 'Not Applicable',
        autoAssignedGroup: 'ECS ISS Binondo',
        targetReportTeam: 'ECS ISS',
      };
    }

    if (normCat.includes('operational')) {
      return {
        category: category || 'Operational Issues',
        subCategory: subCategory || 'General',
        item: item || 'Not Applicable',
        autoAssignedGroup: 'ECS PSD Group',
        targetReportTeam: 'ECS PSD',
      };
    }
  }

  return null;
}
