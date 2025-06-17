# from fastapi import FastAPI

# # Create a FastAPI application
# app = FastAPI()

# @app.get("/")
# def read_root():
#     return {"message": "Hello, FastAPI!"}
# #uvicorn main1:app --reload
# #http://localhost:8000/

# # react
# # useEffect(() => {
# #   const fetchSymbols = async () => {
# #     try {
      
# #       console.log("category_name is updated to:", category_name); // זה ידפיס את הערך החדש
# #       const response = await axios.get(`http://localhost:5000/api/choise/${password}/${category_name}`);
# #       setSymbols(response.data);
# #       settype_symbols(0)
# #       console.log(response.data);
# #     } catch (error) {
# #       console.error("Error loading symbols:", error);
# #     }
# #   };

# app.route("/api/choise/<password>/<category_code>")
# def get_favorite_symbols(password, category_code):
#     try:
#         # functions.Priority_update_for_all_symbols()
#         # symbols = functions.Favorite_symbols(category_code, password, datetime.now())
#         symbols_in_choice = functions.Favorite_symbols(category_code, password, datetime.now())
#         symbols_dict = [functions.symbole2(symbol.symbol_code) + ".png" for symbol in symbols_in_choice]
#         return jsonify(symbols_dict)

