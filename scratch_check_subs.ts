import { db } from "./lib/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

async function checkSubscribers() {
  try {
    console.log("Checking all subscribers...");
    const snapAll = await getDocs(collection(db, "newsletter_subscribers"));
    console.log(`Total documents in newsletter_subscribers: ${snapAll.docs.length}`);
    snapAll.docs.forEach(d => {
      console.log(`ID: ${d.id}, Data:`, d.data());
    });

    console.log("\nChecking active subscribers (active == true)...");
    const q = query(collection(db, "newsletter_subscribers"), where("active", "==", true));
    const snapActive = await getDocs(q);
    console.log(`Active documents found: ${snapActive.docs.length}`);
  } catch (e) {
    console.error("Error checking subscribers:", e);
  }
}

checkSubscribers();
