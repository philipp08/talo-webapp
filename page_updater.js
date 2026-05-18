const fs = require('fs');
const file = 'app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newGridContent = `
              {/* WhatsApp Share — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.17}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-7 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">WhatsApp Invite</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Lade Mitglieder mit einem Klick über WhatsApp direkt in den Verein ein.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e] flex-1 flex flex-col">
                      <WhatsAppShareMock />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Import — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.20}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mb-7 text-teal-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Nahtloser Import</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Datenübernahme aus ClubDesk, WISO oder simplen Excel-Listen in Sekunden.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e] flex-1 flex flex-col">
                      <ImportMock />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* License / No headache — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.23}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-7 text-indigo-500">
                        <Lock size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Lizenzschlüssel</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Einfaches Setup per Lizenzcode. Kopfschmerzfreie Anmeldung ohne Passwort-Chaos.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e] flex-1 flex flex-col">
                      <LicenseKeysMock />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Strafausgleich / Payment — 8 cols */}
              <div className="md:col-span-8">
                <ScrollReveal direction="up" delay={0.26}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 md:p-10 pb-4 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-7 text-orange-500">
                        <Zap size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Strafausgleich per App <span className="ml-1 text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-wider relative -top-0.5">Coming Soon</span></h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm max-w-md">
                        Punkte nicht erreicht? Mitglieder können ihren Ausgleich am Saisonende bequem und sicher direkt über die App zahlen (z. B. Apple Pay).
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e] flex-1 flex flex-col">
                      <ComingSoonMock />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Approval Workflow — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.29}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-7 text-emerald-500">
                        <ShieldCheck size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Genehmigung</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Ein kluger Workflow macht das Freigeben von Punkten für den Admin spielend leicht.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e] flex-1 flex flex-col">
                      <ApprovalWorkflowMock />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
`;

content = content.replace(/<\/div>\s*<\/ScrollReveal>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, `</div>
                </ScrollReveal>
              </div>

${newGridContent}

            </div>
          </div>
        </div>
      </section>`);

fs.writeFileSync(file, content);
