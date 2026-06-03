import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "category_model.joblib")

# Predefined categories:
# rent, groceries, utilities, transport, entertainment, dining, shopping,
# healthcare, education, debt_payment, income, savings, other

# Synthetic training data for the categorizer
TRAINING_DATA = [
    # Rent
    ("monthly rent payment", "rent"),
    ("rent", "rent"),
    ("house rent", "rent"),
    ("apartment rent", "rent"),
    ("landlord", "rent"),
    # Groceries
    ("grocery shopping", "groceries"),
    ("supermarket", "groceries"),
    ("walmart groceries", "groceries"),
    ("whole foods", "groceries"),
    ("trader joes", "groceries"),
    ("d mart", "groceries"),
    ("big basket", "groceries"),
    ("blinkit", "groceries"),
    ("zepto", "groceries"),
    ("swiggy instamart", "groceries"),
    ("upi blinkit paytm", "groceries"),
    ("jiomart", "groceries"),
    ("reliance smart", "groceries"),
    ("ratnadeep", "groceries"),
    ("star bazaar", "groceries"),
    ("milk and eggs", "groceries"),
    # Utilities
    ("electricity bill", "utilities"),
    ("water bill", "utilities"),
    ("internet bill", "utilities"),
    ("comcast", "utilities"),
    ("at&t", "utilities"),
    ("verizon", "utilities"),
    ("gas bill", "utilities"),
    ("phone bill", "utilities"),
    ("airtel", "utilities"),
    ("jio", "utilities"),
    ("vi prepaid", "utilities"),
    ("act fibernet", "utilities"),
    ("bescom", "utilities"),
    ("tsspdcl", "utilities"),
    ("tata play", "utilities"),
    ("adani gas", "utilities"),
    # Transport
    ("transportation", "transport"),
    ("uber", "transport"),
    ("lyft", "transport"),
    ("ola", "transport"),
    ("rapido", "transport"),
    ("gas station", "transport"),
    ("shell", "transport"),
    ("hpcl", "transport"),
    ("bpcl", "transport"),
    ("indian oil", "transport"),
    ("upi hpcl paytm", "transport"),
    ("chevron", "transport"),
    ("subway", "transport"),
    ("train ticket", "transport"),
    ("irctc", "transport"),
    ("metro rail", "transport"),
    ("l and t metro rail", "transport"),
    ("upi l and t metro rail", "transport"),
    ("bus fare", "transport"),
    ("redbus", "transport"),
    ("makemytrip", "transport"),
    ("goibibo", "transport"),
    ("yatra", "transport"),
    ("cleartrip", "transport"),
    ("namma metro", "transport"),
    ("delhi metro", "transport"),
    ("fuel", "transport"),
    ("petrol", "transport"),
    # Entertainment
    ("entertainment", "entertainment"),
    ("netflix", "entertainment"),
    ("hulu", "entertainment"),
    ("spotify", "entertainment"),
    ("movie tickets", "entertainment"),
    ("cinema", "entertainment"),
    ("concert", "entertainment"),
    ("gaming", "entertainment"),
    ("steam", "entertainment"),
    ("bookmyshow", "entertainment"),
    ("pvr cinemas", "entertainment"),
    ("inox", "entertainment"),
    ("hotstar", "entertainment"),
    ("prime video", "entertainment"),
    ("sonyliv", "entertainment"),
    # Dining
    ("restaurant", "dining"),
    ("takeout", "dining"),
    ("uber eats", "dining"),
    ("doordash", "dining"),
    ("starbucks", "dining"),
    ("mcdonalds", "dining"),
    ("cafe", "dining"),
    ("dinner", "dining"),
    ("lunch", "dining"),
    ("zomato", "dining"),
    ("swiggy", "dining"),
    ("upi swiggy", "dining"),
    ("upi zomato", "dining"),
    ("chai point", "dining"),
    ("eatfit", "dining"),
    ("kfc", "dining"),
    ("burger king", "dining"),
    ("dominos", "dining"),
    ("pizza hut", "dining"),
    ("haldirams", "dining"),
    ("bikanervala", "dining"),
    # Shopping
    ("shopping", "shopping"),
    ("amazon", "shopping"),
    ("target", "shopping"),
    ("clothes", "shopping"),
    ("shoes", "shopping"),
    ("electronics", "shopping"),
    ("apple store", "shopping"),
    ("best buy", "shopping"),
    ("flipkart", "shopping"),
    ("myntra", "shopping"),
    ("ajio", "shopping"),
    ("nykaa", "shopping"),
    ("meesho", "shopping"),
    ("tata neu", "shopping"),
    ("croma", "shopping"),
    ("reliance digital", "shopping"),
    # Healthcare
    ("health insurance", "healthcare"),
    ("doctor", "healthcare"),
    ("pharmacy", "healthcare"),
    ("cvs", "healthcare"),
    ("walgreens", "healthcare"),
    ("hospital", "healthcare"),
    ("clinic", "healthcare"),
    ("medicine", "healthcare"),
    ("apollo", "healthcare"),
    ("medplus", "healthcare"),
    ("netmeds", "healthcare"),
    ("pharmeasy", "healthcare"),
    ("1mg", "healthcare"),
    # Education
    ("tuition", "education"),
    ("books", "education"),
    ("course", "education"),
    ("udemy", "education"),
    ("coursera", "education"),
    ("university", "education"),
    ("school fee", "education"),
    # Debt Payment
    ("loan payment", "debt_payment"),
    ("credit card", "debt_payment"),
    ("mortgage", "debt_payment"),
    ("emi", "debt_payment"),
    ("car loan", "debt_payment"),
    ("cred", "debt_payment"),
    ("upi cred", "debt_payment"),
    # Other / Personal UPI
    ("upi", "other"),
    ("upi transfer", "other"),
    ("upi chintalapudi jithend", "other"),
    ("phonepe", "other"),
    ("gpay", "other"),
    ("paytm", "other"),
    # Income
    ("salary", "income"),
    ("paycheck", "income"),
    ("bonus", "income"),
    ("freelance", "income"),
    ("dividend", "income"),
    ("refund", "income"),
    ("deposit", "income"),
    # Savings
    ("savings transfer", "savings"),
    ("investment", "savings"),
    ("mutual fund", "savings"),
    ("stock", "savings"),
    ("vanguard", "savings"),
    ("fidelity", "savings"),
    ("fd", "savings"),
    ("fixed deposit", "savings"),
]

def train_category_model():
    """Trains a simple text classification model and saves it to artifacts."""
    print("[*] Training category model...")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    df = pd.DataFrame(TRAINING_DATA, columns=["description", "category"])
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
        ('clf', LogisticRegression(class_weight='balanced', random_state=42))
    ])
    
    pipeline.fit(df['description'], df['category'])
    
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[OK] Category model saved to {MODEL_PATH}")

_model_cache = None

def load_category_model():
    """Loads the trained category model."""
    global _model_cache
    if _model_cache is not None:
        return _model_cache
        
    if not os.path.exists(MODEL_PATH):
        train_category_model()
        
    _model_cache = joblib.load(MODEL_PATH)
    return _model_cache

def predict_categories(descriptions: list[str]) -> list[str]:
    """Predicts categories for a list of transaction descriptions."""
    if not descriptions:
        return []
        
    model = load_category_model()
    # Fill empty descriptions with "other" conceptually, though the model will handle empty strings
    cleaned_descs = [str(d).lower().strip() if pd.notna(d) else "" for d in descriptions]
    
    predictions = model.predict(cleaned_descs)
    
    # Fallback for completely empty strings or unknown patterns could be handled here
    # but the model will output some category.
    return predictions.tolist()

if __name__ == "__main__":
    train_category_model()
