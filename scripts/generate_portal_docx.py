#!/usr/bin/env python3
"""
CivicLink Portal - Comprehensive System Flow, Visual Inventory & UI Simplification Guide
Generates a publication-grade Microsoft Word (.docx) document with embedded high-resolution screenshots,
architectural mappings, user journey flows, and an actionable UI simplification blueprint.
"""

import os
import zipfile
import html
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
SCREENSHOTS_DIR = os.path.join(PROJECT_ROOT, "portal-screenshots")
OUTPUT_DOCX = os.path.join(PROJECT_ROOT, "CivicLink_Portal_Flow_and_UI_Simplification_Guide.docx")

EMU_PER_INCH = 914400
MAX_WIDTH_INCHES = 6.2
MAX_WIDTH_EMU = int(MAX_WIDTH_INCHES * EMU_PER_INCH)

class DocxBuilder:
    def __init__(self):
        self.paragraphs = []
        self.images = [] # list of (rel_id, filename, full_path, cx, cy)
        self.rel_counter = 1

    def add_para(self, text, style=None, bold=False, italic=False, font_size=11, color="334155", space_after=120, space_before=0, align="left"):
        escaped_text = html.escape(text)
        align_xml = f'<w:jc w:val="{align}"/>' if align != "left" else ""
        b_xml = '<w:b/>' if bold else ''
        i_xml = '<w:i/>' if italic else ''
        sz_xml = f'<w:sz w:val="{int(font_size * 2)}"/><w:szCs w:val="{int(font_size * 2)}"/>'
        color_xml = f'<w:color w:val="{color}"/>' if color else ''
        
        p = f'''<w:p>
  <w:pPr>
    {align_xml}
    <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="276" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      {b_xml}{i_xml}{color_xml}{sz_xml}
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      {b_xml}{i_xml}{color_xml}{sz_xml}
    </w:rPr>
    <w:t xml:space="preserve">{escaped_text}</w:t>
  </w:r>
</w:p>'''
        self.paragraphs.append(p)

    def add_title(self, text):
        self.add_para(text, bold=True, font_size=26, color="00485a", space_before=240, space_after=120, align="center")

    def add_subtitle(self, text):
        self.add_para(text, italic=True, font_size=14, color="527065", space_before=0, space_after=360, align="center")

    def add_heading1(self, text):
        self.add_para(text, bold=True, font_size=18, color="00485a", space_before=360, space_after=140)

    def add_heading2(self, text):
        self.add_para(text, bold=True, font_size=14, color="003946", space_before=240, space_after=100)

    def add_heading3(self, text):
        self.add_para(text, bold=True, font_size=12, color="1e293b", space_before=160, space_after=80)

    def add_bullet(self, bold_prefix, text):
        escaped_prefix = html.escape(bold_prefix)
        escaped_text = html.escape(text)
        p = f'''<w:p>
  <w:pPr>
    <w:pStyle w:val="ListBullet"/>
    <w:ind w:left="420" w:hanging="240"/>
    <w:spacing w:before="40" w:after="80" w:line="260" w:lineRule="auto"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:b/>
      <w:color w:val="00485a"/>
      <w:sz w:val="21"/>
    </w:rPr>
    <w:t xml:space="preserve">• {escaped_prefix} </w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:color w:val="334155"/>
      <w:sz w:val="21"/>
    </w:rPr>
    <w:t xml:space="preserve">{escaped_text}</w:t>
  </w:r>
</w:p>'''
        self.paragraphs.append(p)

    def add_callout(self, title, text, bg_color="F0FDF4", border_color="00485a"):
        escaped_title = html.escape(title)
        escaped_text = html.escape(text)
        tbl = f'''<w:tbl>
  <w:tblPr>
    <w:tblW w:w="9400" w:type="dxa"/>
    <w:tblBorders>
      <w:top w:val="none"/>
      <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
      <w:bottom w:val="none"/>
      <w:right w:val="none"/>
    </w:tblBorders>
    <w:tblCellMar>
      <w:top w:w="140" w:type="dxa"/>
      <w:left w:w="240" w:type="dxa"/>
      <w:bottom w:w="140" w:type="dxa"/>
      <w:right w:w="200" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="9400" w:type="dxa"/>
        <w:shd w:val="clear" w:color="auto" w:fill="{bg_color}"/>
      </w:tcPr>
      <w:p>
        <w:pPr>
          <w:spacing w:before="60" w:after="40"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:b/>
            <w:color w:val="{border_color}"/>
            <w:sz w:val="22"/>
          </w:rPr>
          <w:t>{escaped_title}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr>
          <w:spacing w:before="0" w:after="60"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:color w:val="1e293b"/>
            <w:sz w:val="20"/>
          </w:rPr>
          <w:t>{escaped_text}</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>'''
        self.paragraphs.append(tbl)

    def add_table(self, headers, rows):
        col_w = int(9400 / len(headers))
        tbl = f'''<w:tbl>
  <w:tblPr>
    <w:tblW w:w="9400" w:type="dxa"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:color="CBD5E1"/>
      <w:left w:val="single" w:sz="6" w:color="CBD5E1"/>
      <w:bottom w:val="single" w:sz="8" w:color="94A3B8"/>
      <w:right w:val="single" w:sz="6" w:color="CBD5E1"/>
      <w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/>
      <w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/>
    </w:tblBorders>
    <w:tblCellMar>
      <w:top w:w="120" w:type="dxa"/>
      <w:left w:w="160" w:type="dxa"/>
      <w:bottom w:w="120" w:type="dxa"/>
      <w:right w:w="160" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>'''
        # Header Row
        tbl += '<w:tr><w:trPr><w:tblHeader/></w:trPr>'
        for h in headers:
            tbl += f'''<w:tc>
  <w:tcPr>
    <w:tcW w:w="{col_w}" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="00485A"/>
  </w:tcPr>
  <w:p>
    <w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>
    <w:r>
      <w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr>
      <w:t>{html.escape(h)}</w:t>
    </w:r>
  </w:p>
</w:tc>'''
        tbl += '</w:tr>'

        # Body Rows
        for r_idx, row in enumerate(rows):
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            tbl += '<w:tr>'
            for cell in row:
                tbl += f'''<w:tc>
  <w:tcPr>
    <w:tcW w:w="{col_w}" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="{bg}"/>
  </w:tcPr>
  <w:p>
    <w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>
    <w:r>
      <w:rPr><w:color w:val="1E293B"/><w:sz w:val="19"/></w:rPr>
      <w:t>{html.escape(str(cell))}</w:t>
    </w:r>
  </w:p>
</w:tc>'''
            tbl += '</w:tr>'

        tbl += '</w:tbl><w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>'
        self.paragraphs.append(tbl)

    def add_page_break(self):
        self.paragraphs.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def add_image(self, img_path, caption=None):
        if not os.path.exists(img_path):
            self.add_para(f"[Image file not found: {img_path}]", italic=True, color="991B1B")
            return

        with Image.open(img_path) as img:
            w, h = img.size

        # Compute EMU dimensions respecting max width
        aspect = h / w
        cx = MAX_WIDTH_EMU
        cy = int(cx * aspect)

        # Cap height to 5 inches so it fits nicely on a single portrait page
        max_h_emu = int(4.8 * EMU_PER_INCH)
        if cy > max_h_emu:
            cy = max_h_emu
            cx = int(cy / aspect)

        rel_id = f"rIdImg{self.rel_counter}"
        self.rel_counter += 1
        img_filename = f"image_{self.rel_counter}.png"
        self.images.append((rel_id, img_filename, img_path, cx, cy))

        doc_pr_id = self.rel_counter + 100

        img_xml = f'''<w:p>
  <w:pPr>
    <w:jc w:val="center"/>
    <w:spacing w:before="120" w:after="80"/>
  </w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="{doc_pr_id}" name="Picture {self.rel_counter}"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="{doc_pr_id}" name="{img_filename}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="{rel_id}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="{cx}" cy="{cy}"/>
                </a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                <a:ln w="9525"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>'''
        self.paragraphs.append(img_xml)

        if caption:
            cap_xml = f'''<w:p>
  <w:pPr>
    <w:jc w:val="center"/>
    <w:spacing w:before="40" w:after="180"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:i/>
      <w:color w:val="64748B"/>
      <w:sz w:val="18"/>
    </w:rPr>
    <w:t>Figure: {html.escape(caption)}</w:t>
  </w:r>
</w:p>'''
            self.paragraphs.append(cap_xml)

    def build_zip(self, output_path):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as z:
            # 1. [Content_Types].xml
            ct_items = ['<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
                        '<Default Extension="xml" ContentType="application/xml"/>',
                        '<Default Extension="png" ContentType="image/png"/>',
                        '<Default Extension="jpeg" ContentType="image/jpeg"/>',
                        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
                        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>']
            content_types_xml = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">{"".join(ct_items)}</Types>'
            z.writestr("[Content_Types].xml", content_types_xml)

            # 2. _rels/.rels
            root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''
            z.writestr("_rels/.rels", root_rels)

            # 3. word/_rels/document.xml.rels
            doc_rels = ['<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>']
            for rel_id, filename, _, _, _ in self.images:
                doc_rels.append(f'<Relationship Id="{rel_id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{filename}"/>')
            doc_rels_xml = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{"".join(doc_rels)}</Relationships>'
            z.writestr("word/_rels/document.xml.rels", doc_rels_xml)

            # 4. word/styles.xml
            styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:color w:val="334155"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:before="0" w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>'''
            z.writestr("word/styles.xml", styles_xml)

            # 5. word/media images
            for _, filename, full_path, _, _ in self.images:
                with open(full_path, "rb") as img_file:
                    z.writestr(f"word/media/{filename}", img_file.read())

            # 6. word/document.xml
            body_xml = "".join(self.paragraphs)
            document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>'''
            z.writestr("word/document.xml", document_xml)

        print(f"Successfully generated DOCX at: {output_path}")


def build_guide():
    doc = DocxBuilder()

    # ==================== COVER / TITLE PAGE ====================
    doc.add_para("CIVICLINK ETHIOPIA · PLATFORM ARCHITECTURE & UX GUIDE", bold=True, font_size=11, color="E2C37C", space_before=720, space_after=140, align="center")
    doc.add_title("CivicLink Portal: System Flow, Visual Inventory & UI Simplification Guide")
    doc.add_subtitle("Comprehensive Codebase Structure, End-to-End User Journey Flowcharts, Full-Page Visual Catalog, and Actionable UX Simplification Blueprint")

    doc.add_callout(
        "Document Purpose & Scope",
        "This authoritative document provides an exhaustive review of the civic-link/portal codebase. It details the system architecture, authentication and RBAC models, end-to-end user workflows, a complete 18-screen visual inventory captured directly from the live application, an in-depth usability friction audit, and concrete, actionable design recommendations to make the interface significantly simpler, cleaner, and more productive for municipal staff.",
        bg_color="F4F8F6",
        border_color="00485A"
    )

    doc.add_table(
        ["Attribute", "Specification / Value"],
        [
            ["Document Title", "CivicLink Portal Flow, Screenshots & UI Simplification Guide"],
            ["Target Audience", "Municipal Leadership, Sub-city Staff, Bureau Officers, UX Designers & Engineers"],
            ["Platform Scope", "Portal Administrative Workspace (civic-link/portal)"],
            ["Backend Architecture", "Laravel 13 Sanctum API Engine with SQLite/PostgreSQL RDBMS"],
            ["Frontend Stack", "React 19, TypeScript, Redux Toolkit Query, Vite 8"],
            ["Version & Date", "Version 2.4 — November 2026"],
        ]
    )

    doc.add_page_break()

    # ==================== SECTION 1: EXECUTIVE SUMMARY ====================
    doc.add_heading1("1. Executive Summary & System Objectives")
    doc.add_para(
        "CivicLink Ethiopia is a unified civic engagement and service delivery platform designed to bridge the gap between municipal administration and citizens in Addis Ababa. The Portal application serves as the primary operational workspace for government administrators across three administrative tiers: Global Super Administrators, Sub-City Administrative Officers, and Bureau / Sector Desk Officers."
    )
    doc.add_para(
        "While the system currently boasts extensive feature coverage—ranging from hierarchical service catalog management to desk QR token generation and live CMS previewing—it currently suffers from high visual density, fragmented workflows, and exposure of low-level technical concepts to non-technical civil servants. The objective of this document is to establish a rigorous baseline of current capabilities and chart a clear path toward extreme simplification."
    )

    doc.add_heading2("Core Objectives of the Portal Experience:")
    doc.add_bullet("Citizen Service Transparency:", "Provide standardized, unambiguous service turnaround times, fee structures, required documents, and sequential room directions.")
    doc.add_bullet("Citizen Voice & Fast Redressal:", "Empower bureau officers to triage, inspect, and officially resolve citizen complaints and feedback tickets with full auditability.")
    doc.add_bullet("Physical-to-Digital Desk Continuity:", "Enable walk-in visitors to scan physical QR placards at municipal service halls and immediately lodge verified feedback or check service prerequisites.")
    doc.add_bullet("Strict Multi-Tier Governance:", "Enforce rigorous role-based access control (RBAC) ensuring sub-cities and bureaus operate strictly within their jurisdictional boundaries.")

    # ==================== SECTION 2: PORTAL ARCHITECTURE & STRUCTURE ====================
    doc.add_page_break()
    doc.add_heading1("2. Architecture of the Portal Codebase (`portal/src`)")
    doc.add_para(
        "The portal application is engineered as a modern Single Page Application (SPA) built with React 19, TypeScript, and Redux Toolkit Query (RTK Query), bundled via Vite. The architecture strictly decouples state management, API services, routing guards, and presentation components."
    )

    doc.add_heading2("Directory Structure Breakdown:")
    doc.add_bullet("src/app/", "Central Redux Toolkit store (store.ts) and typed React-Redux hooks (hooks.ts). Configures middleware and cache invalidation tags for all RTK Query slices.")
    doc.add_bullet("src/components/", "Modular component hierarchy divided by domain: accounts, activity, cms, documents, feedback, layout, levels, modals, news, offices, overview, qr, roles, services, and shared.")
    doc.add_bullet("src/context/", "PortalContext providing global UI state: search terms, active filter pills, role impersonation, and global modal state containers.")
    doc.add_bullet("src/features/auth/", "Authentication slice and Sanctum token handling. Handles session recovery from tab-scoped sessionStorage.")
    doc.add_bullet("src/hooks/", "Custom hooks including usePermissions.ts, which verifies granular user permissions against the authenticated user's active permission set.")
    doc.add_bullet("src/pages/", "14 full-screen page controllers orchestrating queries, modal triggers, and data table presentations.")
    doc.add_bullet("src/routes/", "Declarative route configuration (AppRoutes.tsx) wrapped with strict role and permission guards (RoleGuard.tsx).")
    doc.add_bullet("src/services/", "12 dedicated RTK Query API slices communicating with the Laravel backend (baseApi, authApi, servicesApi, feedbackApi, organizationsApi, usersApi, rolesApi, cmsApi, auditLogsApi, qrCodesApi, documentsApi, dashboardApi).")
    doc.add_bullet("src/utils/", "Cryptographic token storage (tokenStorage.ts), SVG QR generation (qrCode.js, qrMath.ts), and formatters.")

    doc.add_heading2("Complete Route Inventory & Access Matrix:")
    doc.add_table(
        ["Route Path", "Page Component", "Required Permission", "Allowed Roles", "Primary Functional Scope"],
        [
            ["/login", "LoginPage", "Public (Guest)", "All", "Authentication with username/password & token issuance."],
            ["/overview", "OverviewPage", "dashboard.view", "Super, Subcity, Bureau", "Operational KPI cards, volume chart, recent activities."],
            ["/services", "ServicesPage", "services.view", "Super, Subcity, Bureau", "Master domain categories and citizen subservices catalog."],
            ["/documents", "DocumentsPage", "documents.view", "Super, Subcity, Bureau", "Citizen document prerequisite catalog and checklist rules."],
            ["/routes", "RoutesPage", "service_steps.view", "Super, Subcity, Bureau", "Physical room navigation steps, floor, and desk guidance."],
            ["/offices", "OfficesPage", "organizations.view", "Super, Subcity, Bureau", "Municipal hierarchy: Sub-cities, Bureaus, Woredas (List & Tree)."],
            ["/feedback", "FeedbackPage", "feedback.view_own", "Super, Subcity, Bureau", "Citizen complaints and satisfaction ratings inbox & resolution."],
            ["/qr", "QRPage", "qr_codes.view", "Super, Subcity, Bureau", "Desk and hallway QR code generator with printable layouts."],
            ["/news", "NewsPage", "news.view", "Super, Subcity, Bureau", "Publish public announcements, notices, and community events."],
            ["/accounts", "AccountsPage", "users.view", "Super, Subcity, Bureau", "Staff account provisioning, role and office assignments."],
            ["/roles", "RolesPermissionsPage", "roles.view", "Super Admin", "Granular 38-permission matrix across 13 security domains."],
            ["/levels", "LevelsPage", "organizations.view", "Super Admin", "Municipal administrative tier depth and hierarchy levels."],
            ["/cms", "LandingPageCms", "cms.manage", "Super Admin", "Citizen portal landing page builder with live split-screen preview."],
            ["/activity", "ActivityPage", "audit_logs.view", "Super Admin", "Immutable audit trail with before/after JSON diffs & IP tracking."],
        ]
    )

    # ==================== SECTION 3: USER JOURNEY FLOWS ====================
    doc.add_page_break()
    doc.add_heading1("3. Detailed User Journey Flows")
    doc.add_para(
        "Below are the end-to-end operational workflows mapping how users interact with the portal, from authentication to daily service administration and feedback redressal."
    )

    doc.add_heading2("Flow 1: Authentication & Dynamic Navigation Provisioning")
    doc.add_para(
        "1. Officer visits `/login` and submits credentials (username/email + password).\n"
        "2. Backend verifies credentials via Laravel Sanctum and returns an API Bearer token, user metadata, assigned role (super_admin, sub_city_admin, bureau_admin), and organization ID.\n"
        "3. Token is stored securely in-memory and tab-scoped `sessionStorage` (preventing token theft via cross-tab persistence).\n"
        "4. Application navigates to `/overview` and triggers `useGetSidebarNavigationQuery`.\n"
        "5. Sidebar dynamically renders only authorized navigation items matching the officer's exact permission scope.\n"
        "6. If an officer attempts to visit an unauthorized path, `RoleGuard` intercepts and displays a branded Access Denied screen."
    )

    doc.add_heading2("Flow 2: Service Catalog & Standard Definition Lifecycle")
    doc.add_para(
        "1. Officer navigates to `/services`.\n"
        "2. Can view existing services grouped under Master Domain Categories (e.g., Civil Status & Vital Records, Taxation & Revenues).\n"
        "3. Clicks 'Create Service' to launch the full-page Service Modal.\n"
        "4. Mode A (Master Category): Defines high-level service domain name and code slug.\n"
        "5. Mode B (Citizen Subservice):\n"
        "   • Tab 1 (Basic Info): Selects Parent Master Category, Subservice Name, Governing Bureau, Target Turnaround Time in minutes, and Citizen Fee (ETB).\n"
        "   • Tab 2 (Required Documents): Searches document catalog, attaches required certificates/IDs, marks them Mandatory or Optional, and adds instructions (e.g. 'Original + 2 copies').\n"
        "   • Tab 3 (Delivery Branches): Selects which sub-cities, woredas, and central bureaus offer this service.\n"
        "6. Submitting commits the service to the database. The service immediately becomes discoverable by citizens on the public portal."
    )

    doc.add_heading2("Flow 3: Room Navigation Guidance Mapping")
    doc.add_para(
        "1. Bureau Officer navigates to `/routes` or clicks the 'Room Route' button on any subservice card.\n"
        "2. Subservices are scoped to the officer's governing bureau.\n"
        "3. Officer clicks 'Configure Route Steps' to open the Route Editor.\n"
        "4. Defines sequential steps a citizen must take upon entering the municipal facility:\n"
        "   • Step 1: Reception Desk (Ground Floor, Room G-01) — Document submission.\n"
        "   • Step 2: Verification Officer (1st Floor, Room 104) — Biometric verification.\n"
        "   • Step 3: Cashier Desk (Ground Floor, Room G-08) — Fee settlement.\n"
        "5. Steps are saved and linked to the service, giving citizens step-by-step physical directions."
    )

    doc.add_heading2("Flow 4: Citizen Feedback & Complaint Redressal")
    doc.add_para(
        "1. Citizen submits a complaint or rating online or via a physical desk QR code.\n"
        "2. Ticket appears in real-time in `/feedback` with status 'Submitted' (Open) and a sentiment rating.\n"
        "3. Unresolved count appears as a notification badge on the sidebar.\n"
        "4. Officer clicks complaint row to open `FeedbackDetailModal`.\n"
        "5. Officer inspects citizen statement, attached service, and contact details.\n"
        "6. Officer transitions status to 'Under Review' while investigating.\n"
        "7. Officer drafts official resolution findings and marks ticket 'Resolved'.\n"
        "8. Citizen checks their ticket code on the citizen portal to read the official resolution response."
    )

    doc.add_heading2("Flow 5: Office QR Code Generation & Deployment")
    doc.add_para(
        "1. Officer navigates to `/qr`.\n"
        "2. Selects their municipal office and desk label ('Woreda 02 Civil Desk').\n"
        "3. System generates an SVG QR code encoding a direct URL to the citizen feedback form pre-populated with office and service metadata.\n"
        "4. Officer previews the QR code and clicks 'Print Poster Layout' or 'Download PNG'.\n"
        "5. Printed poster is placed on service hall desks and reception counters for citizens to scan."
    )

    # ==================== SECTION 4: VISUAL PAGE INVENTORY (SCREENSHOTS) ====================
    doc.add_page_break()
    doc.add_heading1("4. Visual Page Catalog & Screen Inventory")
    doc.add_para(
        "The following section presents high-resolution screenshots of all 18 primary views and modal interfaces captured directly from the live CivicLink portal application, accompanied by technical specifications and usability evaluations."
    )

    screens = [
        ("01_login_page.png", "1. Authentication Screen (/login)", "Super Admin, Sub-city Admin, Bureau Officer",
         "The gateway to the platform. Features a split-screen layout with government branding and inspirational civic copy on the left, and a credentials input card on the right.",
         "Clean, high-contrast, and focused. Usability is solid, though password visibility toggles and clear error banners are essential for mobile devices."),

        ("02_overview_dashboard.png", "2. Executive Operations Dashboard (/overview)", "All Authenticated Roles",
         "The central command dashboard. Presents 4 top-level metric cards (Total Services, Offering Offices, Active Accounts, Citizen Feedback), volume trends chart, satisfaction breakdown, priority complaints focus list, quick action buttons, and recent activity feed.",
         "High visual density. Showing all widgets simultaneously creates cognitive overload for frontline officers who only need their daily pending complaints."),

        ("03_services_catalog.png", "3. Service Standards Catalog (/services)", "Super Admin, Sub-city Admin, Bureau Officer",
         "Hierarchical service catalog displaying Master Domain Categories (collapsible cards) and Citizen Subservices with operational specifications (turnaround minutes, fee in ETB, attached documents count, offering branches count, and room route buttons).",
         "Excellent hierarchical organization. However, the top filter toolbar has multiple dropdowns that can feel cluttered on smaller monitors."),

        ("04_service_modal_tab1_basic.png", "4. Service Modal — Tab 1: Basic Specifications", "Super Admin, Sub-city Admin",
         "Full-screen modal for authoring services. Allows toggling between Master Category and Citizen Subservice, selecting parent master, entering name, code slug, governing bureau, target duration, fee, active status, and citizen description.",
         "Transformed into full-screen layout. Well organized, though technical fields like 'Code Slug' could be auto-generated or hidden under Advanced."),

        ("05_service_modal_tab2_documents.png", "5. Service Modal — Tab 2: Required Documents Checklist", "Super Admin, Sub-city Admin",
         "Multi-column responsive grid displaying available citizen documents. Officers can search catalog, attach documents via checkbox, toggle Mandatory vs Optional, and provide specific instructions.",
         "Massive improvement over the old 320px scroll container. Clean 2-column grid makes attaching prerequisites fast and transparent."),

        ("06_service_modal_tab3_branches.png", "6. Service Modal — Tab 3: Delivery Branch Assignment", "Super Admin, Sub-city Admin",
         "Responsive multi-column grid displaying municipal sub-cities, local child offices, and central bureaus. Officers can select offering branches or click '+ All Sub-cities' for city-wide services.",
         "Multi-column card layout replaces the old vertical list, utilizing wide screen space efficiently."),

        ("07_documents_catalog.png", "7. Citizen Document Prerequisites Catalog (/documents)", "Super Admin, Sub-city Admin",
         "Central repository of all citizen document types (e.g. Kebele ID, Birth Notification, Marriage Certificate, Power of Attorney). Shows document code, description, active status, and count of linked services.",
         "Functional data table. Could be integrated directly into the Services view as a contextual tab rather than requiring a separate top-level route."),

        ("08_room_routes.png", "8. Room Navigation Routes (/routes)", "Super Admin, Sub-city Admin, Bureau Officer",
         "Interface for configuring sequential physical room directions for citizens visiting municipal offices. Displays subservices filtered by bureau with route step status pills.",
         "Good visual feedback. Reordering steps and assigning room numbers is intuitive, but could benefit from a visual floorplan diagram in the future."),

        ("09_offices_directory_list.png", "9. Offices Directory — List View (/offices)", "Super Admin, Sub-city Admin",
         "Tabular directory of municipal offices, showing Office Name, Organization Level (Sub-city, Bureau, Woreda), Parent Organization hierarchy breadcrumb, Phone/Email, and Officer in Charge.",
         "Clean and informative. However, having separate routes for /offices, /subcities, and /bureaus that share this page is confusing."),

        ("10_offices_directory_tree.png", "10. Offices Directory — Hierarchical Tree View (/offices)", "Super Admin, Sub-city Admin",
         "Interactive tree visualization displaying the municipal hierarchy: City Administration -> Sub-cities -> Woredas -> Bureaus. Nodes expand and collapse to reveal branch depth.",
         "Visualizes municipal structure clearly. Needs persistent search filtering so users can find a child office without expanding every parent node."),

        ("11_feedback_inbox.png", "11. Citizen Feedback & Complaints Inbox (/feedback)", "Super Admin, Sub-city Admin, Bureau Officer",
         "Inbox of all citizen complaints, suggestions, and satisfaction ratings. Shows Citizen Name, Service & Office, Feedback Type pill, Sentiment Rating, Submission Date, and Resolution Status.",
         "The most important operational screen for frontline officers. Currently opens details in a popup modal; an email-style split-pane would be far superior."),

        ("12_qr_code_manager.png", "12. Office QR Code Manager (/qr)", "Super Admin, Sub-city Admin, Bureau Officer",
         "Desk QR generator and catalog. Displays active QR tokens with direct target URLs, office affiliations, live SVG QR preview, print poster layout trigger, and PNG downloader.",
         "Highly useful for physical office halls. The print poster button provides great real-world utility."),

        ("13_news_events.png", "13. News & Announcements Hub (/news)", "Super Admin, Sub-city Admin, Bureau Officer",
         "Content management for municipal announcements, public notices, press releases, and community events. Displays post cards with publication status, sub-city tag, and dates.",
         "Clean card layout. Drafting announcements is straightforward and previews render accurately."),

        ("14_accounts_staff.png", "14. Staff Accounts & Access Management (/accounts)", "Super Admin, Sub-city Admin",
         "Staff directory and provisioning interface. Lists municipal officers with Name, Username, Email, Phone, Assigned Role, Organization Affiliation, and Active Status.",
         "Standard administrative data table. Password reset and organization reassignment are easily accessible."),

        ("15_roles_permissions.png", "15. Roles & Permissions Governance (/roles)", "Super Admin",
         "Enterprise RBAC configuration interface. Displays system roles (Super Admin, Sub-city Admin, Bureau Admin) alongside an extensive 38-permission matrix across 13 security domains.",
         "Extremely comprehensive and powerful. Too complex for casual users, but appropriately restricted to Super Administrators only."),

        ("16_organization_levels.png", "16. Organization Levels & Tiers (/levels)", "Super Admin",
         "Administrative hierarchy configuration. Defines municipal hierarchy ranks: Level 1 (City / Sub-City), Level 2 (Woreda), Level 3 (Bureau / Department), Level 4 (Service Desk).",
         "Clean and concise tier management."),

        ("17_landing_page_cms.png", "17. Citizen Landing Page CMS (/cms)", "Super Admin",
         "Split-screen live CMS builder. Left pane allows editing 8 sections of the citizen portal (Announcement, Hero, Quick Search, Service Guide, Journey, News, Feedback, Footer) with a live iframe preview on the right.",
         "Remarkable split-screen preview capability. Allows seeing changes in real-time before publishing."),

        ("18_activity_audit_logs.png", "18. System Activity & Audit Trail (/activity)", "Super Admin",
         "Immutable administrative audit trail. Records every create, update, delete, and login event with Actor, Role, Entity, Timestamp, IP address, and inspectable before/after JSON diffs.",
         "Essential for security and governance compliance. JSON inspector modal gives complete transparency."),
    ]

    for filename, title, roles, desc, usability in screens:
        img_path = os.path.join(SCREENSHOTS_DIR, filename)
        doc.add_heading2(title)
        doc.add_para(f"Target Roles: {roles}", bold=True, color="00485a", space_after=40)
        doc.add_para(f"Functionality: {desc}", space_after=60)
        doc.add_image(img_path, caption=title)
        doc.add_callout("UX & Usability Assessment", usability, bg_color="F8FAFC", border_color="475569")
        doc.add_page_break()

    # ==================== SECTION 5: USABILITY AUDIT ====================
    doc.add_heading1("5. In-Depth Usability & UI Complexity Audit")
    doc.add_para(
        "A rigorous heuristic evaluation of the current portal interface reveals several critical friction points that increase cognitive load, slow down municipal staff, and create barrier-to-entry for non-technical users."
    )

    doc.add_heading2("Key Friction Points Identified:")
    
    doc.add_bullet("1. Excessive Visual Density & Metric Card Overload:", 
                   "Almost every screen features 4 large metric cards, a toolbar with 3-4 separate search/filter inputs, and dense tables with 8+ columns. Municipal workers are overwhelmed by numbers rather than guided toward immediate action items.")

    doc.add_bullet("2. Workflow Fragmentation (The 4-Page Hop):", 
                   "Publishing a complete citizen service currently requires visiting 4 separate pages: 1) create documents in /documents, 2) create service in /services, 3) define room steps in /routes, and 4) generate desk QR in /qr. These closely related tasks should be unified into a single streamlined workspace.")

    doc.add_bullet("3. Disjointed Office Directory Navigation:", 
                   "Having separate routes /offices, /subcities, and /bureaus that all render OfficesPage creates mental confusion. Toggling between flat List View and Tree View resets scroll position and hides context.")

    doc.add_bullet("4. One-Size-Fits-All Information Architecture:", 
                   "A frontline bureau officer (e.g. at Revenues or Vital Records) only cares about: a) today's pending complaints, b) their room numbers, and c) printing their desk QR code. Yet their dashboard displays the same enterprise analytics as a platform Super Admin.")

    doc.add_bullet("5. Modal Fatigue & Dialog Claustrophobia:", 
                   "Every detail inspection (audit diffs, user editing, office editing, feedback resolution) opens in a modal dialog. Repeatedly opening and closing popups disrupts workflow continuity.")

    doc.add_bullet("6. Technical Jargon Exposure:", 
                   "Internal technical terminology such as 'Slug', 'Scope Level', 'Canonical Navigation Item', 'XSRF Token', and 'Entity Type' is visible to government staff who simply want to manage public services.")

    # ==================== SECTION 6: SIMPLIFICATION BLUEPRINT ====================
    doc.add_page_break()
    doc.add_heading1("6. Strategic UI Simplification Blueprint")
    doc.add_para(
        "To transform CivicLink Portal into an effortless, highly productive tool for city officials, we propose five foundational UI/UX architectural enhancements."
    )

    doc.add_heading2("Proposal 1: Unified 'Services & Operations Hub'")
    doc.add_para(
        "Consolidate the currently fragmented Services, Documents, and Room Routes pages into a unified management hub:\n"
        "• Main Screen: Visual Service Cards with integrated action pills.\n"
        "• In-Context Document Prerequisites: Allow adding a new document requirement directly inside the Service Modal without leaving the page.\n"
        "• Contextual Drawers: Clicking 'Room Route' or 'Desk QR' slides out a smooth side drawer directly from the service card rather than navigating to a separate route."
    )

    doc.add_heading2("Proposal 2: Email-Style Split-Pane Feedback Inbox")
    doc.add_para(
        "Replace the modal-based complaint inspection with a modern two-column master-detail layout:\n"
        "• Left Column (35%): Compact scrollable list of complaints with unread indicator, citizen name, service badge, and status pill.\n"
        "• Right Column (65%): Instant full-screen view of the selected complaint, citizen phone, history timeline, and an inline 'Respond & Resolve' form. Eliminates 100% of popup modal clicks!"
    )

    doc.add_heading2("Proposal 3: 'My Tasks Today' Role-Tailored Dashboard")
    doc.add_para(
        "For Sub-City and Bureau staff, replace passive statistical charts with an actionable daily agenda:\n"
        "• Top Banner: '🚨 3 Citizen Complaints Need Your Response Today' (with 1-click resolve button).\n"
        "• Middle Row: Quick Action shortcuts ('+ New Citizen Subservice', '🖨️ Print Desk Placard', '📢 Post Notice').\n"
        "• Bottom: Live activity stream filtered strictly to their assigned municipal bureau."
    )

    doc.add_heading2("Proposal 4: Progressive Disclosure & Design System Modernization")
    doc.add_para(
        "• Simplify Tables: Show only the 4 most vital columns by default (Name, Office, Status, Action); hide secondary metadata under an expandable row drawer.\n"
        "• Clean Typography: Increase body text from cramped 11-12px to readable 13.5-14.5px with 1.5 line height.\n"
        "• Advanced Settings Collapse: Hide code slugs, duration overrides, and JSON configurations behind a simple 'Advanced Options' accordion."
    )

    doc.add_heading2("Proposal 5: Tablet & Mobile Responsive Excellence")
    doc.add_para(
        "Government officers often use iPad/Android tablets at service counters. Convert wide 8-column data tables into touch-friendly stacked cards on screen widths under 1024px to eliminate horizontal scrolling entirely."
    )

    # ==================== SECTION 7: PRIORITIZATION ROADMAP ====================
    doc.add_page_break()
    doc.add_heading1("7. Implementation Prioritization Roadmap")
    doc.add_para(
        "To achieve maximum usability gains with minimal disruption, the proposed simplifications are phased by priority and effort:"
    )

    doc.add_table(
        ["Phase & Initiative", "Target Component", "User Impact", "Implementation Effort", "Priority"],
        [
            ["Phase 1: Split-Pane Feedback Inbox", "FeedbackPage.tsx", "High (Eliminates modal fatigue for daily complaint triage)", "Low (Layout refactor)", "P0 (Immediate)"],
            ["Phase 2: Role-Tailored Daily Agenda", "OverviewPage.tsx", "High (Directs staff to urgent tasks immediately)", "Medium (Widget restructuring)", "P0 (Immediate)"],
            ["Phase 3: Unified Service Hub & Drawers", "ServicesPage.tsx, ServiceModal.tsx", "High (Eliminates the 4-page hop across services/docs/routes)", "Medium (Drawer integration)", "P1 (Next Sprint)"],
            ["Phase 4: Progressive Disclosure Tables", "OfficesPage.tsx, AccountsPage.tsx", "Medium (Reduces visual clutter and table scrolling)", "Low (Column pruning & drawers)", "P1 (Next Sprint)"],
            ["Phase 5: Technical Terminology Cleanup", "All Pages & Modals", "Medium (Replaces database jargon with friendly civic terms)", "Low (String refactoring)", "P2 (Follow-up)"],
        ]
    )

    doc.add_callout(
        "Summary & Next Steps",
        "This guide serves as the definitive reference for the CivicLink Portal. All 18 views have been documented with live screenshots and architectural context. When ready to proceed with implementation, the phased roadmap above outlines a clear, risk-free path to delivering an intuitive, world-class government operations interface.",
        bg_color="F4F8F6",
        border_color="00485A"
    )

    doc.build_zip(OUTPUT_DOCX)


if __name__ == "__main__":
    build_guide()

