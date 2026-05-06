import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

try:
    import openai
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    from google.generativeai import GenerativeModel
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)

class AIFinanceAssistant:
    """AI-powered finance assistant for expense analysis and insights."""
    
    def __init__(self):
        self.openai_client = None
        self.gemini_model = None
        self.ai_provider = os.getenv("AI_PROVIDER", "openai").lower()
        
        # Initialize AI provider
        if self.ai_provider == "openai" and OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
                logger.info("OpenAI client initialized")
            else:
                logger.warning("OpenAI API key not found")
        elif self.ai_provider == "gemini" and GEMINI_AVAILABLE:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini client initialized")
            else:
                logger.warning("Gemini API key not found")
        else:
            logger.warning(f"AI provider '{self.ai_provider}' not available or not configured")
    
    def is_available(self) -> bool:
        """Check if AI service is available."""
        return (self.ai_provider == "openai" and self.openai_client is not None) or \
               (self.ai_provider == "gemini" and self.gemini_model is not None)
    
    async def analyze_expenses(self, expenses: List[Dict[str, Any]], user_question: str = "") -> str:
        """
        Analyze expenses and provide financial insights.
        
        Args:
            expenses: List of expense data
            user_question: Specific question from user
            
        Returns:
            AI-generated financial insights
        """
        if not self.is_available():
            return "AI service is not available. Please check API configuration."
        
        if not expenses:
            return "No expense data available for analysis."
        
        # Prepare expense data for analysis
        expense_summary = self._prepare_expense_summary(expenses)
        
        # Create the prompt
        system_prompt = self._create_financial_analysis_prompt(expense_summary, user_question)
        
        try:
            if self.ai_provider == "openai":
                return await self._call_openai(system_prompt)
            elif self.ai_provider == "gemini":
                return await self._call_gemini(system_prompt)
        except Exception as e:
            logger.error(f"AI analysis error: {str(e)}")
            return f"Sorry, I encountered an error while analyzing your expenses: {str(e)}"
    
    def _prepare_expense_summary(self, expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Prepare expense data for AI analysis."""
        if not expenses:
            return {}
        
        # Calculate basic statistics
        total_spending = sum(exp.get('amount', 0) for exp in expenses)
        categories = {}
        monthly_spending = {}
        
        for expense in expenses:
            amount = expense.get('amount', 0)
            category = expense.get('category', 'Unknown')
            date = expense.get('date')
            
            # Category breakdown
            categories[category] = categories.get(category, 0) + amount
            
            # Monthly breakdown
            if date:
                try:
                    if isinstance(date, str):
                        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                    else:
                        date_obj = date
                    month_key = date_obj.strftime('%Y-%m')
                    monthly_spending[month_key] = monthly_spending.get(month_key, 0) + amount
                except:
                    continue
        
        # Sort categories by amount
        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)
        
        # Get recent expenses (last 30 days)
        thirty_days_ago = datetime.now().date() - timedelta(days=30)
        recent_expenses = []
        for expense in expenses:
            try:
                if isinstance(expense.get('date'), str):
                    date_obj = datetime.strptime(expense.get('date'), '%Y-%m-%d').date()
                else:
                    date_obj = expense.get('date')
                if date_obj and date_obj >= thirty_days_ago:
                    recent_expenses.append(expense)
            except:
                continue
        
        return {
            'total_spending': total_spending,
            'transaction_count': len(expenses),
            'categories': dict(sorted_categories),
            'top_category': sorted_categories[0] if sorted_categories else None,
            'monthly_spending': monthly_spending,
            'recent_expenses_count': len(recent_expenses),
            'average_transaction': total_spending / len(expenses) if expenses else 0,
            'date_range': {
                'start': min(exp.get('date') for exp in expenses if exp.get('date')),
                'end': max(exp.get('date') for exp in expenses if exp.get('date'))
            }
        }
    
    def _create_financial_analysis_prompt(self, expense_summary: Dict[str, Any], user_question: str) -> str:
        """Create a comprehensive prompt for financial analysis."""
        base_prompt = f"""
You are an expert financial advisor and expense analyst. Analyze the following expense data and provide intelligent insights.

EXPENSE SUMMARY:
{self._format_expense_data(expense_summary)}

CURRENT DATE: {datetime.now().strftime('%Y-%m-%d')}

Your role is to:
1. Provide clear, actionable financial insights
2. Answer specific questions about spending patterns
3. Suggest practical money-saving tips
4. Identify unusual spending patterns
5. Give personalized advice based on the data

RESPONSE GUIDELINES:
- Be conversational and friendly
- Provide specific, actionable advice
- Use bullet points for clarity
- Include percentages and comparisons when helpful
- Focus on practical tips the user can implement
- If asked for recommendations, be specific and realistic
"""

        if user_question:
            base_prompt += f"\n\nSPECIFIC USER QUESTION: {user_question}\n\nPlease address this question directly in your analysis."
        else:
            base_prompt += "\n\nProvide a comprehensive financial overview including spending patterns, top categories, and money-saving recommendations."
        
        return base_prompt
    
    def _format_expense_data(self, expense_summary: Dict[str, Any]) -> str:
        """Format expense data for the AI prompt."""
        if not expense_summary:
            return "No expense data available."
        
        formatted = []
        formatted.append(f"Total Spending: ${expense_summary.get('total_spending', 0):.2f}")
        formatted.append(f"Number of Transactions: {expense_summary.get('transaction_count', 0)}")
        formatted.append(f"Average Transaction: ${expense_summary.get('average_transaction', 0):.2f}")
        
        if expense_summary.get('top_category'):
            top_cat = expense_summary['top_category']
            formatted.append(f"Top Spending Category: {top_cat[0]} (${top_cat[1]:.2f})")
        
        if expense_summary.get('categories'):
            formatted.append("\nSpending by Category:")
            for category, amount in list(expense_summary['categories'].items())[:5]:
                formatted.append(f"  - {category}: ${amount:.2f}")
        
        if expense_summary.get('monthly_spending'):
            formatted.append("\nRecent Monthly Spending:")
            recent_months = sorted(expense_summary['monthly_spending'].items())[-3:]
            for month, amount in recent_months:
                formatted.append(f"  - {month}: ${amount:.2f}")
        
        return "\n".join(formatted)
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API for analysis."""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful financial advisor."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    async def _call_gemini(self, prompt: str) -> str:
        """Call Gemini API for analysis."""
        try:
            response = await self.gemini_model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise

# Global AI assistant instance
ai_assistant = AIFinanceAssistant()

async def analyze_user_expenses(expenses: List[Dict[str, Any]], user_question: str = "") -> str:
    """Convenience function to analyze user expenses."""
    return await ai_assistant.analyze_expenses(expenses, user_question)
