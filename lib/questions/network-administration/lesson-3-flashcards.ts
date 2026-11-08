/**
 * Key-terms flashcards — Network Administration, Lecture 3 "Introduction to Network Design".
 * Front = term, back = meaning, detail = example or note from the lecture.
 */
import type { Flashcard } from "../../types";

type Card = [front: string, back: string, detail?: string];

const GROUPS: [group: string, cards: Card[]][] = [
  [
    "Planning",
    [
      ["Network planning", "The foundation of network design: defining the purpose, requirements and scope of the network.", "Goal: a network that supports the organization's operations efficiently."],
      ["Identify Requirements", "Determine what the network must achieve: number of users, devices, data types and expected performance.", "Data types: voice, video, data."],
      ["Defining Objectives", "Clarify short-term and long-term goals.", "Scalability, remote access, integration with cloud services."],
      ["Assessing Current Infrastructure", "If a network already exists, evaluate its hardware, bandwidth capacity and security measures.", "Check the old switches before buying new ones."],
      ["Budget and Constraints", "Financial limits, available equipment and staff expertise that guide the design.", "\"We only have ₱150,000 and one IT staff member.\""],
      ["Network Size and Coverage", "The number of connected devices and the physical area covered.", "A single office floor vs. multiple branches."],
      ["Network plan", "The outcome of planning: defines what needs to be built and how it will serve the organization.", "Often drawn as a floor layout with PCs, printers, router and modem."],
    ],
  ],
  [
    "Topology",
    [
      ["Network topology", "The physical and logical layout of connected devices.", "Chosen right after the planning stage."],
      ["Bus topology", "All devices share a single communication line.", "Simple and cost-effective, but prone to collisions and not scalable."],
      ["Star topology", "All devices connect to a central device, usually a switch or hub.", "Good performance and easy fault isolation."],
      ["Ring topology", "Devices form a circular path for data to travel.", "Predictable performance, but can be difficult to troubleshoot."],
      ["Mesh topology", "Each device connects directly to others.", "High reliability, but more cost and complexity."],
      ["Hybrid topology", "Combines elements of different topologies.", "e.g., star-bus, to balance performance, cost and flexibility."],
    ],
  ],
  [
    "Devices",
    [
      ["Router", "Directs data between networks and manages Internet connections.", "Connects the office LAN to the ISP."],
      ["Switch", "Connects multiple devices within a local network and segments traffic using VLANs.", "Keeps accounting traffic separate from students' traffic."],
      ["Access point", "Provides wireless connectivity for mobile devices.", "Wi-Fi for phones and laptops in the library."],
      ["Firewall", "Protects against unauthorized access and cyber threats.", "Blocks outsiders from reaching internal systems."],
      ["Server", "Hosts applications, files and services needed by users.", "A school's enrollment system or file shares."],
      ["NAS (Network Attached Storage)", "A centralized repository of data.", "One shared place for everyone's files."],
    ],
  ],
  [
    "IP addressing",
    [
      ["IP address planning", "Assigning IP addresses systematically, based on network hierarchy and future growth, so every device communicates without conflicts.", ""],
      ["IPv4", "32-bit addresses.", "e.g., 192.168.1.1"],
      ["IPv6", "128-bit addresses, for larger scalability.", ""],
      ["Dual-stack", "Using IPv4 and IPv6 at the same time.", "Keeps older IPv4 devices working while moving to IPv6."],
      ["Subnetting", "Dividing a network into smaller, manageable subnetworks.", "Improves performance and security, and reduces broadcast traffic."],
      ["Private vs public IP", "Private IPs are used within internal networks; public IPs are used for Internet-facing devices.", ""],
      ["Static IP", "An address manually assigned to a critical device.", "Servers and printers."],
      ["Dynamic IP / DHCP", "An address assigned automatically by DHCP (Dynamic Host Configuration Protocol).", "Client devices such as student laptops and phones."],
      ["Documentation and Future Planning (addressing)", "Keep a record of allocated addresses and leave room for expansion.", "Reserve ranges for new users or departments."],
    ],
  ],
  [
    "Documentation",
    [
      ["Network documentation", "Often overlooked but one of the most critical aspects of design: a clear reference for maintenance, troubleshooting and future upgrades.", "Ensures transparency, quick problem resolution and seamless handover between IT personnel."],
      ["Network diagram", "A visual representation of devices, connections, IP addresses, VLANs and topology.", "Drawn with Cisco Packet Tracer, Microsoft Visio or Draw.io."],
      ["Device inventory", "A list of all network devices with model numbers, firmware versions and serial numbers.", "Switches, routers, firewalls."],
      ["Configuration files", "Backup copies of device configurations and setup parameters.", "Restore a replacement router to the same setup."],
      ["Address tables", "A detailed record of IP allocations, MAC addresses and DHCP scopes.", ""],
      ["Security policy", "Documentation of firewall rules, access control lists (ACLs) and user permissions.", ""],
      ["Change logs", "A record of modifications, updates and maintenance activities.", "\"What changed last Tuesday, and who did it?\""],
    ],
  ],
  [
    "Big picture",
    [
      ["The structured steps of network design", "Planning → selecting topology and devices → address allocation → documentation.", "Results in networks that are robust, cost-effective and ready for future expansion."],
      ["A well-designed network ensures…", "Reliability, scalability and security.", "Network design = strategic planning, efficient configuration and proper documentation."],
    ],
  ],
];

export const networkDesignFlashcards: Flashcard[] = GROUPS.flatMap(([group, cards], g) =>
  cards.map(([front, back, detail], i) => ({
    id: `netadm3-card-${g + 1}-${String(i + 1).padStart(2, "0")}`,
    group,
    front,
    back,
    ...(detail ? { detail } : {}),
  })),
);
