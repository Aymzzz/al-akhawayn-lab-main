AUI IMMERSIVE LAB SYSTEM (AILS)
Version: 2.0 (Master Specification)
Date: October 2025
1. Executive Summary
The AUI Immersive Operating System (AILS) is a web-based infrastructure designed to bridge the gap between traditional university lectures and immersive Augmented Reality (AR) learning.
Unlike generic AR tools that enforce a steep learning curve, AILS is built on a Service-First Philosophy: it provides a flexible infrastructure where professors retain full pedagogical control while utilizing AI as an accelerator. The platform bridges three critical gaps:
Content Creation: transforming static PDFs into interactive spatial lessons without coding.
Pedagogical Flexibility: supporting both open-ended exploration and rigorous, graded assessments.
Data Intelligence: leveraging Data analytics to correlate spatial interaction with academic performance.
2. Core Strategic Philosophy
2.1 The "Service" Model
We recognize that faculty time is the scarcest resource in higher education. Therefore, AILS is designed not just as a tool, but as a Service Platform:
The Concierge Protocol: The platform allows Admins (the Lab) to "ghost-write" courses for professors—uploading materials, selecting models, and annotating them—so the professor only needs to "Review and Publish."
Gradual Adoption: Professors can start with fully manual creation (total control) and gradually adopt AI automation features as trust is established.
2.2 Pedagogical Empowerment
AILS does not replace the professor with an AI Agent. Instead, it positions the AI as a Co-Pilot:
Context Boundaries: AI Agents are strictly constrained to the specific lecture notes provided by the professor, eliminating hallucinations and ensuring syllabus alignment.
Spatial Integrity: Assessments move beyond text, requiring students to demonstrate physical understanding of complex systems.
3. Module I: The Professor Studio ("The Command Center")
Goal: To provide an intuitive "No-Code" studio where professors create immersive lessons with granular control.
3.1 Content Ingestion & Context Engine
Context Injection: The professor uploads lecture materials (PDF, PPTX, DOCX).
RAG Processing (Imane’s Pipeline): The system parses these documents to build a specific Knowledge Graph for the course. This serves as the "Ground Truth" for all AI interactions within that specific module.
Privacy Controls: Professors can toggle whether the AI Agent is active for a specific assignment or if the experience is strictly "Read-Only."
3.2 The Asset Discovery Hub
Integrated Search: A built-in search bar queries approved 3D repositories (e.g., Sketchfab API, Google Poly) using keywords extracted from the syllabus.
Proprietary Uploads: Support for direct .glb or .gltf uploads for faculty who have their own research models.
Model Preview: Real-time 3D preview to verify asset quality before import.
3.3 The Annotation Workbench (Hybrid Workflow)
Professors can choose their level of automation for annotating 3D models:
Manual Mode (Total Control):
Spatial Pinning: The professor rotates the model and clicks on any mesh (part) to drop a permanent "Hotspot."
Rich Media Layers: Each hotspot can contain:
Text Definitions: Custom written explanations.
Voice Notes: A 15-60 second audio recording of the professor explaining the specific part (e.g., "Notice the curvature of this valve; this is where the pressure builds...").
AI-Assist Mode (Accelerator): - This is for later & start-up, too ambitious but nice nonetheless -
Auto-Labeling: The professor clicks "Generate Labels." The Agent analyzes the 3D metadata and the uploaded PDF, suggesting 5-10 key hotspots automatically.
Review Process: The professor can Edit, Approve, or Delete these suggestions.
3.4 The Assessment Engine
Text-Based Logic: Creation of MCQs or Short Essay questions.
Spatial Quizzing (Key Feature):
Identification Questions: The professor selects a part (e.g., The Piston) as the target. The question generated is: "Locate the Piston on the model."
Functional Questions: The professor highlights an area. The prompt becomes: "Click on the component responsible for fuel injection."
Grading Configuration: Set due dates, number of attempts, and "Reveal Answers" settings.
4. Module II: The Student Hub ("The Immersive Hall")
Goal: To engage students with deep visuals while ensuring academic integrity and accessibility.
4.1 Accessibility & Platform
Universal Web Access: No app installation required. Runs natively in Chrome/Safari on Laptops, Tablets, and Smartphones.
WebXR Support: Automatically detects VR/AR hardware (e.g., Meta Quest, Android ARCore) and offers an "Enter AR" button for immersive viewing.
4.2 Exploration Mode (Study Phase)
Interactive Viewing: Full freedom to Rotate, Zoom, and Explode the model.
Hotspot Learning: Clicking pins reveals the Professor’s notes or plays their voice explanation.
AI Copilot (Context-Aware):
Constraint: The AI only answers questions based on the Professor’s uploaded PDF.
Capability: "What is this part?" (AI uses metadata to identify the part).
Socratic Mode: If enabled, the AI guides the student with hints rather than direct answers.
4.3 Assessment Mode (Graded Assignments)
The "Lockdown" Environment:
When an assignment starts, the AI Chat is disabled (unless explicitly allowed).
Anti-Cheat: Copy/Paste functionality is blocked. Browser tab focus is monitored to detect tab switching.
Spatial Answers: Students answer questions by physically interacting with the model (clicking parts) rather than just writing text.
Submission Integrity: Once submitted, the model interaction is locked, and the timestamped data is sent to the Professor.
5. Module III: The Admin & Concierge Portal
Goal: To provide the "Service" layer that ensures adoption, system health, and operational support.
5.1 The Concierge Service ("We Do It For You")
Ghost-Creation: Admins (The Lab Team) have "Super-User" access to enter any Professor's workspace (with permission).
Workflow:
Professor emails PDF and topic request.
Admin uploads content, finds the best 3D model, applies initial annotations, and sets up the Draft.
Admin sends a "Review Link" to the Professor.
Professor clicks "Publish."
Correction Support: If a model link breaks or a hotspot is misplaced, Admins can hot-fix live courses without disrupting student access.
5.2 System Oversight
User Management: Provisioning accounts for Professors and linking Students via university ID.
Course Mapping: Linking internal AILS Course IDs to the University’s LMS IDs (e.g., linking "Bio_101" to "Canvas_ID_882").
Resource Monitoring: Tracking API token usage (Sketchfab/OpenAI) and storage limits.
6. Module IV: The Analytics Suite ("Big Data Value")
This section differentiates AILS from basic AR viewers. We sell Insights, not just Graphics.
6.1 Professor Analytics (Pedagogical Insights)
Interaction Heatmaps:
Visual: A color-coded overlay on the 3D model showing where students spent the most time looking/clicking.
Actionable Insight: "60% of the class clicked the 'Left Ventricle' when asked for the 'Right Ventricle'. This concept needs review."
Concept Gap Analysis:
Metric: Correlation between "Questions asked to AI" and "Quiz Errors."
Actionable Insight: "Students frequently asked the Agent about 'Thermodynamics' and subsequently failed Question 3."
Assignment Reports:
Grade distribution curves.
Specific "Problem Questions" where the majority of the class failed.
Visual Correction: The Professor can see a replay or snapshot of exactly where a student clicked during a Spatial Quiz to understand their misconception.
6.2 Admin Analytics (ROI & Usage)
Engagement Index: Comparison of dwell time on AILS vs. traditional LMS pages.
Adoption Metrics: Number of Active Courses, Total Models Deployed, and Student Interaction Hours.
7. Technical Architecture
7.1 Frontend (The Interface)
Framework: React.js (for dynamic dashboarding).
3D Engine: <model-viewer> (Google). This ensures lightweight, web-native AR without the heavy overhead of Unity/Unreal.
Styling: Tailwind CSS for responsive design (Mobile/Tablet/Desktop).
7.2 Backend (The Brain)
API Layer: Python FastAPI.
AI Engine:
RAG Pipeline: Logic for parsing PDFs and chunking context.
Agent Logic: Context management and Intent Detection.
Spatial Logic: Raycasting utilities to map 2D screen clicks to 3D Mesh IDs.
7.3 Data Persistence
Relational DB (PostgreSQL): Stores User Profiles, Course Metadata, Assignment Definitions, and Grades.
Graph DB (Neo4j): Stores the relationships between Concepts, PDFs, and 3D Model parts.
Analytics Store: Time-series logging of student interactions (Clicks, Rotations, Chat Logs).
8. Development Roadmap
Phase 1: The Core Service (Concierge Pilot)
Focus: Manual Tools for Admins.
Deliverable: A functional Admin Portal where we can build a course and a Student Portal where they can view it.
Key Feature: Text Annotations + PDF Context RAG.
Phase 2: The Creator Studio (Professor Access)
Focus: Self-Service Tools.
Deliverable: The Professor Login, Search Integration, and "Audio Note" recording.
Key Feature: Spatial Quizzing (Click-to-answer).
Phase 3: The Data Integrator (University Scale)
Focus: Analytics & LMS connection.
Deliverable: The Heatmap Dashboard and Canvas/Moodle Grade Sync.
Key Feature: Full "Class Performance" Reports.
