/* ===== Everything a non-developer may need to change lives in this file. ===== */
/* Every contact detail on the site comes from here. Leave a link empty ('') and its button is hidden. */
export const CONTACT = {
  phone:'0141 000 0000',            // shown on the site
  tel:'+441410000000',              // the same number, in international format, for tap-to-call
  whatsapp:'447000000000',          // WhatsApp number, no + or spaces
  email:'hello@precisionpropertycare.co.uk',
  instagram:'https://www.instagram.com/precisionpropertycare/',
  facebook:'',                      // e.g. https://m.me/yourpagename
  googleReviews:'',                 // link to the Google reviews page
  hours:'Monday to Saturday, 7am to 7pm',
  areas:'Glasgow, East Dunbartonshire, East Renfrewshire and Renfrewshire'
};
export const PHONE = CONTACT.phone;
export const WA = CONTACT.whatsapp;
export const WA_LINK = `https://wa.me/${WA}?text=${encodeURIComponent("Hi, I'd like to ask about a job")}`;

/* ===== Services. Prices are rough guides: replace with your real rates. =====
   Either per-unit (unit/low/high/min/def/max) or fixed options (choices: key -> [label, low, high]). */
export const GROUPS = {inside:'Inside your home', outside:'Outside your home'};
export const SERVICES = {
  boilers:{group:'inside', label:'Boilers and heating', short:'New boilers, swaps, servicing and repairs.',
    q:'What do you need?', def:'swap', choices:{service:['Boiler service',70,110], repair:['Boiler repair',120,350], swap:['Combi boiler swap',2000,3200], conversion:['System to combi conversion',3500,5500]},
    intro:'New boilers, like-for-like swaps, annual services and breakdown repairs. Our Gas Safe registered engineers fit, register and warranty every new boiler.',
    includes:['Free survey and a fixed price before we start','Old boiler removed and disposed of','System flush and new controls set up','Gas Safe certificate and manufacturer warranty registered'],
    faqs:[['How long does a boiler swap take?','A like-for-like combi swap is usually done in a day. Converting from a system or back boiler takes two to three days.'],["Do you service boilers you didn't fit?",'Yes. We service and repair most makes, whoever installed them.']]},
  kitchens:{group:'inside', label:'Kitchen fitting', short:'Full kitchen supply and fit, or fitting only.',
    q:'How big is the kitchen?', def:'medium', choices:{small:['Small, up to 8 units',4000,7000], medium:['Medium, 8 to 14 units',7000,12000], large:['Large, 15 units or more',12000,20000], fit:['Fitting only, you supply the kitchen',1800,4000]},
    intro:'From design to the final plinth, we handle the whole kitchen: units, worktops, plumbing, electrics, tiling and flooring, with one team managing every trade.',
    includes:['Design help and a fixed written quote','Old kitchen stripped out and taken away','Plumbing, electrics and appliances connected','Tiling, flooring and finishing done in house'],
    faqs:[['How long does a new kitchen take to fit?','Most kitchens take one to two weeks, depending on size and how much plastering or electrical work is needed.'],['Can you fit a kitchen I have already bought?','Yes. Choose "Fitting only" in the price guide and we will price the labour and materials to install it.']]},
  bathrooms:{group:'inside', label:'Bathroom fitting', short:'Bathrooms, en-suites and walk-in showers.',
    q:'What type of bathroom is it?', def:'standard', choices:{ensuite:['Cloakroom or en-suite',3500,6000], shower:['Shower room or walk-in shower',5000,9000], standard:['Standard family bathroom',6000,10000], large:['Large bathroom',10000,16000]},
    intro:'Complete bathroom refits and new en-suites, including the plumbing, electrics, tiling and flooring, so you deal with one team from strip-out to finish.',
    includes:['Old suite stripped out and removed','All plumbing and electrical work','Wall and floor tiling','Final clean and walkthrough before we leave'],
    faqs:[['How long will I be without a bathroom?','A typical refit takes five to ten working days. We plan the work so you have a working toilet for as much of that time as possible.'],['Can you supply the bathroom suite?','Yes. We can supply everything, or fit a suite you have chosen yourself.']]},
  electrical:{group:'inside', label:'Electrical work', short:'Rewires, fuse boxes, sockets, lighting and safety checks.',
    q:'What do you need?', def:'small', choices:{small:['Sockets, switches or lights',120,300], cu:['Fuse box (consumer unit) upgrade',450,750], eicr:['Electrical safety check (EICR)',150,250], rewire:['Full rewire, 2 to 3 bed home',3500,6500]},
    intro:'Qualified electricians for everything from an extra socket to a full rewire. Notifiable work is tested and certified, so you have the paperwork insurers and buyers ask for.',
    includes:['Fault finding and repairs','Fuse box upgrades and full rewires','Lighting, sockets and outdoor power','Safety checks and landlord certificates'],
    faqs:[['Do I need an EICR?','Landlords in Scotland need one at least every five years, and one is worth having when you buy or sell a home.'],['Will a rewire make a mess?','There is some disruption, but we lift and relay floors carefully and can patch and paint once the work is done.']]},
  plumbing:{group:'inside', label:'Plumbing', short:'Leaks, taps, toilets, radiators and new pipework.',
    q:'What do you need?', def:'repair', choices:{repair:['Leak, tap or toilet repair',90,220], radiator:['New or moved radiator',200,450], appliance:['Washing machine or dishwasher hook-up',100,200], outside:['Outside tap',120,250]},
    intro:'Tidy, reliable plumbing for leaks, blockages, taps, toilets, radiators and new pipework. We turn up when we say and leave the place as we found it.',
    includes:['Leaks, drips and blockages fixed','Taps, toilets and showers replaced','Radiators added, moved or swapped','Appliances and outside taps connected'],
    faqs:[['Can you come out quickly?','Send us a photo on WhatsApp and we will tell you how soon we can get to you.'],['Do you charge a call-out fee?','No. You get a price before any work starts.']]},
  flooring:{group:'inside', label:'Flooring and carpets', short:'Carpet, laminate, LVT and wood flooring laid.',
    unit:'m²', low:25, high:70, min:250, def:20, max:200, hint:'A typical living room is 15 to 20 m². A whole ground floor is often 40 to 60 m².',
    intro:'Carpet, laminate, luxury vinyl tile and engineered wood, laid on properly prepared floors with doors trimmed and edges finished.',
    includes:['Old flooring lifted and taken away','Subfloor levelled and prepared','Carpet, laminate, LVT or wood laid','Doors trimmed and thresholds fitted'],
    faqs:[['Can you supply the flooring?','Yes, or we can lay flooring you have bought yourself.'],['How long does it take?','Most rooms are done in a day. A full ground floor usually takes two to three days.']]},
  patio:{group:'outside', label:'Patios', short:'Porcelain, sandstone and slab patios.',
    unit:'m²', low:110, high:180, min:2500, def:25, max:150, hint:'A typical back patio is 15 to 30 m².',
    intro:'Porcelain, sandstone and slab patios laid on a properly dug and compacted base, so they stay level and drain the way they should.',
    includes:['Ground dug out and old surface removed','Compacted base with proper falls for drainage','Porcelain, sandstone or concrete slabs','Pointing, edging and a full clean-up'],
    faqs:[['How long does a patio take?','Most patios are finished in three to five days.'],['Do I need planning permission?','Not usually for a back garden patio. We will tell you if your job is an exception.']]},
  driveway:{group:'outside', label:'Driveways', short:'Block paved and slab driveways.',
    unit:'m²', low:90, high:150, min:3500, def:40, max:250, hint:'One car space is about 15 m². A double drive is about 40 m².',
    intro:'Block paved and slab driveways built on a solid base, with the drainage done properly so surface water stays off the road.',
    includes:['Old drive dug out and taken away','Base built to take the weight of a car','Block paving, slabs and edging','Drainage channels where needed'],
    faqs:[['How long does a new driveway take?','A typical double drive takes four to seven days.'],['Will I need a dropped kerb?','If you are creating a new access, yes. We can talk you through applying to the council.']]},
  fencing:{group:'outside', label:'Fencing', short:'New fences, panels and gates.',
    unit:'m', low:90, high:160, min:900, def:20, max:150, hint:'Measure the length of fence in metres. One side of a garden is often 10 to 20 m.',
    intro:'New fences, panels and gates, and repairs to the ones you have. Posts are set properly so they stay standing through a Scottish winter.',
    includes:['Old fencing removed','Posts set in concrete','Panel, closeboard or slatted fencing','Gates hung and fitted'],
    faqs:[['Can you repair part of a fence?','Yes. We replace broken panels and posts without redoing the whole run.'],['Who owns the fence between gardens?','Your title deeds should say. We are happy to work with you and your neighbour.']]},
  turf:{group:'outside', label:'Turf and lawns', short:'Fresh turf and artificial grass.',
    unit:'m²', low:45, high:85, min:900, def:40, max:300, hint:'Real or artificial. A small back lawn is often 30 to 50 m².',
    intro:'New turf or artificial grass, laid on ground that has been cleared, levelled and prepared so it looks right for years.',
    includes:['Old lawn or surface removed','Ground levelled and prepared','Fresh turf or artificial grass laid','Edging and a full tidy-up'],
    faqs:[['Real or artificial?','Real turf costs less up front. Artificial grass costs more but needs almost no upkeep.'],['How soon can we use it?','Artificial grass can be used straight away. Fresh turf needs two to three weeks to root.']]},
  garden:{group:'outside', label:'Garden makeovers', short:'Complete garden transformations.',
    unit:'m²', low:120, high:240, min:5000, def:60, max:400, hint:'Measure the whole area you want redone.',
    intro:'Full garden makeovers that turn overgrown or tired spaces into gardens you use, combining patios, lawns, fencing and planting in one project.',
    includes:['Clearance and waste removal','Patios, paths and lawns','Fencing, planting and borders','One plan and one price'],
    faqs:[['Can you work to a design?','Yes, yours or ours. We can sketch a plan after the site visit.'],['How long does a makeover take?','Usually one to three weeks, depending on the size and what is involved.']]},
  washing:{group:'outside', label:'Power washing', short:'Driveways, patios and decking cleaned.',
    unit:'m²', low:3, high:6, min:120, def:50, max:300, hint:'Driveways, patios, paths and decking. A double drive is about 40 m².',
    intro:'Driveways, patios, paths and decking cleaned back to their best, with joints re-sanded and surfaces sealed if you want them to stay that way.',
    includes:['Moss, weeds and grime removed','Joints re-sanded on block paving','Optional sealing to protect the surface','Surrounding area rinsed and tidied'],
    faqs:[['Will power washing damage my driveway?','Not when it is done properly. We adjust the pressure to suit the surface.'],['How often should it be done?','Every one to two years keeps most surfaces looking good.']]},
  gutters:{group:'outside', label:'Gutter clearing', short:'Gutters cleared and downpipes checked.',
    q:'What type of house is it?', def:'semi', choices:{terraced:['Terraced or flat',60,90], semi:['Semi-detached',80,120], detached:['Detached',110,170], large:['Large detached',160,240]},
    intro:'Gutters cleared and downpipes checked, so rainwater goes where it should instead of down your walls.',
    includes:['Every gutter cleared','Downpipes checked and unblocked','Before and after photos sent to you','Optional fascia and soffit wash'],
    faqs:[['How often should gutters be cleared?','Once a year, or twice if you have trees nearby.'],['Do you need to go on the roof?','No. We work from ladders or the ground with a gutter vacuum.']]},
  repairs:{group:'repairs', label:'Repairs and maintenance', short:'Odd jobs, fixes and regular upkeep.', noEst:true,
    intro:'The jobs that keep getting put off: doors, gates, fences, steps, sealant, shelving and general repairs around the home and garden.',
    includes:['Doors, locks and handles','Gates, fences and steps','Sealant, grouting and small fixes','Shelving and fitting jobs'],
    faqs:[['Is there a minimum charge?','Send us a list of jobs and we will price them together, which usually works out cheaper.'],['Can you do regular maintenance?','Yes. Landlords and busy homeowners use us for ongoing upkeep.']]}
};
export const EXTRAS = {
  strip:{label:'Remove and dispose of the old kitchen', pct:.08, for:['kitchens']},
  ktile:{label:'Splashback tiling', pct:.06, for:['kitchens']},
  kfloor:{label:'New kitchen flooring', pct:.08, for:['kitchens']},
  btile:{label:'Fully tiled walls', pct:.12, for:['bathrooms']},
  bmove:{label:'Move the toilet, bath or shower to a new spot', pct:.10, for:['bathrooms']},
  flush:{label:'Power flush the heating system', add:[300,450], for:['boilers']},
  smart:{label:'Smart thermostat', add:[150,280], for:['boilers']},
  fold:{label:'Lift and dispose of the old flooring', pct:.12, for:['flooring']},
  stairs:{label:'Stairs as well', add:[250,450], for:['flooring']},
  decor:{label:'Patch and paint walls afterwards', pct:.10, for:['electrical']},
  removal:{label:'Remove an old surface, lawn or fence first', pct:.12, for:['patio','driveway','fencing','turf','garden']},
  access:{label:'Tight access, with no side gate or room for a digger', pct:.10, for:['patio','driveway','turf','garden']},
  sand:{label:'Re-sand the joints after cleaning', pct:.25, for:['washing']},
  seal:{label:'Seal the surface after cleaning', pct:.35, for:['washing']},
  fascia:{label:'Wash the fascias and soffits too', pct:.5, for:['gutters']}
};
/* est: the size (number) or option key used when someone clicks "get a price for something similar" */
export const PROJECTS = [
  {kind:'kitchens', title:'Kitchen supply and fit', place:'Bearsden', size:'Medium kitchen, 12 units', est:'medium', value:9800, q:'From ripping out the old units to the last plinth, it was spotless and done in eight days.', by:'Claire M.'},
  {kind:'bathrooms', title:'Family bathroom refit', place:'Newton Mearns', size:'Standard bathroom', est:'standard', value:7400, q:'They handled the plumbing, electrics and tiling, so we only had one team to deal with.', by:'Graeme K.'},
  {kind:'garden', title:'Back garden makeover', place:'Milngavie', size:'85 m²', est:85, value:14500, q:'We never used the garden before. Now it feels like another room of the house.', by:'Priya S.'},
  {kind:'boilers', title:'Combi boiler swap', place:'Clarkston', size:'Combi to combi', est:'swap', value:2650, q:'Old boiler out and the new one running in a day. The heating has never been better.', by:'Jamie R.'},
  {kind:'flooring', title:'LVT through the ground floor', place:'Bishopbriggs', size:'48 m²', est:48, value:2900, q:'Looks brilliant, and every door was trimmed to fit.', by:'Fiona B.'},
  {kind:'washing', title:'Driveway power wash and re-sand', place:'Giffnock', size:'60 m²', est:60, value:420, q:'Looks like a new driveway. They came out two days after I messaged.', by:'Alan D.'},
  {kind:'electrical', title:'Fuse box upgrade', place:'Shawlands', size:'Consumer unit', est:'cu', value:620, q:'Neat work, and they talked us through the certificate.', by:'Hassan T.'},
  {kind:'patio', title:'Porcelain patio', place:'Milngavie', size:'28 m²', est:28, value:4800, q:'Easy to deal with from the first message to the last day.', by:'Ross W.'},
  {kind:'plumbing', title:'Radiator replacement', place:'Partick', size:'Three radiators', est:'radiator', value:980, q:'Quick, clean and the price was exactly what we were told.', by:'Emma L.'},
  {kind:'turf', title:'Artificial lawn', place:'Clarkston', size:'45 m²', est:45, value:3100, q:'No more mud through the house. The kids are out there every day.', by:'Louise H.'},
  {kind:'driveway', title:'Block paved driveway', place:'Giffnock', size:'42 m²', est:42, value:6200, q:'Tidy, on time, and the final price matched the estimate.', by:'Mark P.'},
  {kind:'fencing', title:'Full boundary fence', place:'Bishopbriggs', size:'32 m', est:32, value:3900, q:'Solid job. The neighbours have already asked for the number.', by:'Steven C.'}
];
export const OTHER = {other:'Something else'};
export const STAGES = ['New','Contacted','Site visit','Quote sent','Won','Lost'];
export const SOURCES = {google:'Google', facebook:'Facebook', instagram:'Instagram', search_other:'Other search engine', website:'Another website', direct:'Typed in or bookmarked', referral:'Word of mouth', phone:'Phone call', whatsapp:'WhatsApp', repeat:'Repeat customer'};
export const WEB_SOURCES = ['google','facebook','instagram','direct','referral'];
export const STEPS = ['Job','Size','Your details','Your price'];

/* ===== Web addresses and search descriptions ===== */
export const SITE = { name:'Precision Property Care', town:'Glasgow' };
export const SLUGS = {
  boilers:'boilers-and-heating', kitchens:'kitchen-fitting', bathrooms:'bathroom-fitting', electrical:'electrician',
  plumbing:'plumbing', flooring:'flooring-and-carpets', patio:'patios', driveway:'driveways', fencing:'fencing',
  turf:'turf-and-lawns', garden:'garden-makeovers', washing:'power-washing', gutters:'gutter-clearing', repairs:'repairs-and-maintenance'
};
export const serviceUrl = k => `/services/${SLUGS[k]}/`;
export const serviceMeta = k => `${SERVICES[k].label} in Glasgow and surrounding areas. ${SERVICES[k].short} See guide prices online and get a free quote from Precision Property Care.`;
