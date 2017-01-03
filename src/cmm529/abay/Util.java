package cmm529.abay;
import java.util.Date;
import java.text.DateFormat;

public class Util
{
/**
 * Converting a String into a Date object.
 * @param s	A string which can be parsed into a Date. e.g. "2014/03/20".
 * @return	The converted Date object.
 */
public static long stringToDateLong(String s)
{
try	{
	Date d = new Date(s);
	return d.getTime();
	//return DateFormat.getInstance().parse(s);
	} catch (Exception e)
		{
		return 0;
		}
} //end method


} //end class
