import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
import numpy as np
from scipy import stats

logger = logging.getLogger(__name__)

class ExpenseAnomalyDetector:
    """Advanced expense anomaly detection using statistical methods and ML logic."""
    
    def __init__(self):
        self.z_score_threshold = 2.5  # Z-score threshold for outliers
        self.iqr_multiplier = 1.5  # IQR multiplier for outliers
        self.duplicate_threshold = 0.01  # 1% similarity threshold for duplicates
        self.category_spike_threshold = 3.0  # 3x average for category spikes
        
    def detect_anomalies(self, expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detect various types of anomalies in expense data.
        
        Args:
            expenses: List of expense dictionaries
            
        Returns:
            Dictionary containing all detected anomalies
        """
        if not expenses or len(expenses) < 3:
            return {
                'anomalies': [],
                'summary': {
                    'total_expenses': len(expenses),
                    'anomaly_count': 0,
                    'anomaly_types': {}
                }
            }
        
        # Extract numerical data for analysis
        amounts = [float(exp.get('amount', 0)) for exp in expenses if exp.get('amount')]
        categories = [exp.get('category', 'Unknown') for exp in expenses]
        dates = [exp.get('date') for exp in expenses if exp.get('date')]
        
        anomalies = []
        
        # 1. Detect unusually high expenses (statistical outliers)
        high_amount_anomalies = self._detect_high_amount_anomalies(expenses, amounts)
        anomalies.extend(high_amount_anomalies)
        
        # 2. Detect category spending spikes
        category_anomalies = self._detect_category_spikes(expenses, categories)
        anomalies.extend(category_anomalies)
        
        # 3. Detect duplicate transactions
        duplicate_anomalies = self._detect_duplicates(expenses)
        anomalies.extend(duplicate_anomalies)
        
        # 4. Detect unusual timing patterns
        timing_anomalies = self._detect_timing_anomalies(expenses, dates)
        anomalies.extend(timing_anomalies)
        
        # 5. Detect rapid successive transactions
        rapid_succession_anomalies = self._detect_rapid_succession(expenses, dates)
        anomalies.extend(rapid_succession_anomalies)
        
        # Summarize anomaly types
        anomaly_summary = self._summarize_anomalies(anomalies)
        
        return {
            'anomalies': anomalies,
            'summary': {
                'total_expenses': len(expenses),
                'anomaly_count': len(anomalies),
                'anomaly_types': anomaly_summary,
                'detection_timestamp': datetime.now().isoformat()
            }
        }
    
    def _detect_high_amount_anomalies(self, expenses: List[Dict[str, Any]], amounts: List[float]) -> List[Dict[str, Any]]:
        """Detect unusually high expenses using Z-score and IQR methods."""
        if len(amounts) < 3:
            return []
        
        anomalies = []
        
        # Method 1: Z-score detection
        mean_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        
        # Method 2: IQR detection
        q1, q3 = np.percentile(amounts, [25, 75])
        iqr = q3 - q1
        lower_bound = q1 - (self.iqr_multiplier * iqr)
        upper_bound = q3 + (self.iqr_multiplier * iqr)
        
        for i, expense in enumerate(expenses):
            amount = float(expense.get('amount', 0))
            
            # Calculate Z-score
            if std_amount > 0:
                z_score = abs(amount - mean_amount) / std_amount
            else:
                z_score = 0
            
            # Check against thresholds
            is_z_outlier = z_score > self.z_score_threshold
            is_iqr_outlier = amount > upper_bound
            
            if is_z_outlier or is_iqr_outlier:
                anomalies.append({
                    'type': 'high_amount',
                    'expense_id': expense.get('id'),
                    'amount': amount,
                    'category': expense.get('category'),
                    'date': expense.get('date'),
                    'z_score': z_score,
                    'iqr_upper_bound': upper_bound,
                    'severity': self._calculate_severity(amount, mean_amount, upper_bound),
                    'description': self._generate_high_amount_description(amount, mean_amount, z_score, upper_bound)
                })
        
        return anomalies
    
    def _detect_category_spikes(self, expenses: List[Dict[str, Any]], categories: List[str]) -> List[Dict[str, Any]]:
        """Detect unusual spending spikes in specific categories."""
        anomalies = []
        
        # Group expenses by category
        category_totals = {}
        category_counts = {}
        for expense in expenses:
            category = expense.get('category', 'Unknown')
            amount = float(expense.get('amount', 0))
            
            if category not in category_totals:
                category_totals[category] = []
                category_counts[category] = 0
            
            category_totals[category].append(amount)
            category_counts[category] += 1
        
        # Analyze each category for spikes
        for category, amounts in category_totals.items():
            if len(amounts) < 2:  # Need at least 2 transactions for comparison
                continue
                
            mean_amount = np.mean(amounts)
            std_amount = np.std(amounts)
            
            # Look for amounts significantly higher than category average
            for i, amount in enumerate(amounts):
                if std_amount > 0:
                    z_score = (amount - mean_amount) / std_amount
                else:
                    z_score = 0
                
                if z_score > self.category_spike_threshold:
                    # Find the corresponding expense
                    matching_expenses = [exp for exp in expenses 
                                       if exp.get('category') == category and 
                                       float(exp.get('amount', 0)) == amount]
                    
                    for expense in matching_expenses:
                        anomalies.append({
                            'type': 'category_spike',
                            'expense_id': expense.get('id'),
                            'amount': amount,
                            'category': category,
                            'date': expense.get('date'),
                            'category_average': mean_amount,
                            'category_std': std_amount,
                            'z_score': z_score,
                            'severity': self._calculate_severity(amount, mean_amount, mean_amount + (3 * std_amount)),
                            'description': self._generate_category_spike_description(category, amount, mean_amount, z_score)
                        })
                        break  # Only add one anomaly per transaction
        
        return anomalies
    
    def _detect_duplicates(self, expenses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect potentially duplicate transactions."""
        anomalies = []
        
        for i, expense1 in enumerate(expenses):
            amount1 = float(expense1.get('amount', 0))
            date1 = expense1.get('date')
            category1 = expense1.get('category')
            
            for j, expense2 in enumerate(expenses[i+1:], i+1):
                amount2 = float(expense2.get('amount', 0))
                date2 = expense2.get('date')
                category2 = expense2.get('category')
                
                # Check for potential duplicates (same amount, category, close date)
                if (abs(amount1 - amount2) / max(amount1, amount2) < self.duplicate_threshold and
                    category1 == category2 and date1 and date2):
                    
                    # Calculate date difference
                    try:
                        date_obj1 = datetime.strptime(date1, '%Y-%m-%d').date()
                        date_obj2 = datetime.strptime(date2, '%Y-%m-%d').date()
                        days_diff = abs((date_obj1 - date_obj2).days)
                    except:
                        days_diff = 0
                    
                    anomalies.append({
                        'type': 'duplicate_transaction',
                        'expense_id': expense2.get('id'),
                        'amount': amount2,
                        'category': category2,
                        'date': date2,
                        'similarity_score': 1 - (abs(amount1 - amount2) / max(amount1, amount2)),
                        'days_difference': days_diff,
                        'severity': 'medium',
                        'description': f"Potential duplicate transaction: ${category2} - ${amount2:.2f} on {date2}"
                    })
        
        return anomalies
    
    def _detect_timing_anomalies(self, expenses: List[Dict[str, Any]], dates: List[str]) -> List[Dict[str, Any]]:
        """Detect unusual timing patterns in expenses."""
        anomalies = []
        
        # Convert dates and sort
        valid_dates = []
        for expense in expenses:
            if expense.get('date'):
                try:
                    date_obj = datetime.strptime(expense.get('date'), '%Y-%m-%d').date()
                    valid_dates.append((date_obj, expense))
                except:
                    continue
        
        if len(valid_dates) < 2:
            return anomalies
        
        valid_dates.sort(key=lambda x: x[0])
        
        # Look for unusual patterns
        for i, (date_obj, expense) in enumerate(valid_dates):
            # Check for very late night transactions (after 11 PM)
            if date_obj.hour >= 23:
                anomalies.append({
                    'type': 'unusual_timing',
                    'expense_id': expense.get('id'),
                    'amount': float(expense.get('amount', 0)),
                    'category': expense.get('category'),
                    'date': expense.get('date'),
                    'time_of_day': date_obj.strftime('%H:%M'),
                    'severity': 'low',
                    'description': f"Unusual late night transaction at {date_obj.strftime('%H:%M')}"
                })
            
            # Check for very early morning transactions (before 5 AM)
            elif date_obj.hour <= 5:
                anomalies.append({
                    'type': 'unusual_timing',
                    'expense_id': expense.get('id'),
                    'amount': float(expense.get('amount', 0)),
                    'category': expense.get('category'),
                    'date': expense.get('date'),
                    'time_of_day': date_obj.strftime('%H:%M'),
                    'severity': 'low',
                    'description': f"Unusual early morning transaction at {date_obj.strftime('%H:%M')}"
                })
        
        return anomalies
    
    def _detect_rapid_succession(self, expenses: List[Dict[str, Any]], dates: List[str]) -> List[Dict[str, Any]]:
        """Detect rapid successive transactions that might indicate errors."""
        anomalies = []
        
        # Sort by date
        valid_expenses = []
        for expense in expenses:
            if expense.get('date'):
                try:
                    date_obj = datetime.strptime(expense.get('date'), '%Y-%m-%d').date()
                    valid_expenses.append((date_obj, expense))
                except:
                    continue
        
        valid_expenses.sort(key=lambda x: x[0])
        
        # Look for multiple transactions on same day
        daily_transactions = {}
        for date_obj, expense in valid_expenses:
            date_str = date_obj.strftime('%Y-%m-%d')
            if date_str not in daily_transactions:
                daily_transactions[date_str] = []
            daily_transactions[date_str].append(expense)
        
        # Flag days with many transactions
        for date_str, day_expenses in daily_transactions.items():
            if len(day_expenses) > 5:  # More than 5 transactions in one day
                for expense in day_expenses[3:]:  # Flag 4th+ transactions
                    anomalies.append({
                        'type': 'rapid_succession',
                        'expense_id': expense.get('id'),
                        'amount': float(expense.get('amount', 0)),
                        'category': expense.get('category'),
                        'date': expense.get('date'),
                        'daily_transaction_count': len(day_expenses),
                        'severity': 'medium',
                        'description': f"Rapid succession: {len(day_expenses)} transactions on {date_str}"
                    })
        
        return anomalies
    
    def _calculate_severity(self, amount: float, baseline: float, threshold: float) -> str:
        """Calculate anomaly severity based on deviation from baseline."""
        if amount > threshold * 2:
            return 'critical'
        elif amount > threshold * 1.5:
            return 'high'
        elif amount > threshold:
            return 'medium'
        else:
            return 'low'
    
    def _generate_high_amount_description(self, amount: float, mean_amount: float, z_score: float, upper_bound: float) -> str:
        """Generate description for high amount anomalies."""
        return (f"Unusually high expense of ${amount:.2f} detected. "
                f"This is {z_score:.1f} standard deviations above your average of ${mean_amount:.2f}. "
                f"Normal range for this category is below ${upper_bound:.2f}.")
    
    def _generate_category_spike_description(self, category: str, amount: float, mean_amount: float, z_score: float) -> str:
        """Generate description for category spike anomalies."""
        return (f"Unusual spending spike in {category} category. "
                f"Transaction of ${amount:.2f} is {z_score:.1f} standard deviations above "
                f"your typical {category} average of ${mean_amount:.2f}.")
    
    def _summarize_anomalies(self, anomalies: List[Dict[str, Any]]) -> Dict[str, int]:
        """Summarize anomalies by type."""
        summary = {}
        for anomaly in anomalies:
            anomaly_type = anomaly.get('type', 'unknown')
            summary[anomaly_type] = summary.get(anomaly_type, 0) + 1
        return summary

# Global anomaly detector instance
anomaly_detector = ExpenseAnomalyDetector()

def detect_expense_anomalies(expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convenience function to detect anomalies in expenses."""
    return anomaly_detector.detect_anomalies(expenses)
